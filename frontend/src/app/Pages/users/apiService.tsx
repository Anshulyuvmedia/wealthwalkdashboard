import { toast } from "sonner";
import type { TdUser, UserFormData } from "./interfaces";
import axios from "axios";

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api",
});

const getValidToken = async (): Promise<string> => {
    let adminToken = localStorage.getItem("adminToken");
    console.log("Stored adminToken:", adminToken); // Debug
    if (adminToken) {
        try {
            const tokenData = JSON.parse(adminToken);
            console.log("Parsed tokenData:", tokenData); // Debug
            const { id, ttl, created } = tokenData;
            if (!id) {
                throw new Error("Token ID is missing");
            }
            const createdDate = new Date(created);
            const expirationDate = new Date(createdDate.getTime() + ttl * 1000);
            console.log("Token expiration:", expirationDate); // Debug
            if (new Date() > expirationDate) {
                console.log("Token expired, removing and refreshing");
                localStorage.removeItem("adminToken");
                throw new Error("Authentication token has expired");
            }
            try {
                await apiClient.get("/TdUsers/validateToken", {
                    headers: { Authorization: `Bearer ${id}` },
                });
                console.log("Token validated successfully:", id);
                return id;
            } catch (error) {
                console.error("Token validation failed:", error.response?.data || error);
                localStorage.removeItem("adminToken");
                throw new Error("Invalid token");
            }
        } catch (e) {
            console.error("Token parsing error:", e);
            localStorage.removeItem("adminToken");
        }
    }
    console.log("Attempting fallback login");
    try {
        const response = await apiClient.post("/TdUsers/loginWithPassword", {
            email: "admin@gmail.com",
            password: "admin123", // Update to match reset password
        });
        const { user, token } = response.data;
        console.log("New token obtained:", token); // Debug
        localStorage.setItem("adminToken", JSON.stringify(token));
        localStorage.setItem("admin", JSON.stringify(user));
        return token.id;
    } catch (error: any) {
        console.error("Failed to log in admin - Full error:", error.response?.data || error);
        toast.error("Failed to authenticate. Please log in again.");
        throw new Error("Unable to obtain valid token");
    }
};

export const apiService = {
    getUsers: async (): Promise<TdUser[]> => {
        try {
            const token = await getValidToken();
            const response = await apiClient.get("/TdUsers", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (error: any) {
            console.error("Failed to fetch users:", error.response?.data || error);
            toast.error(error.response?.data?.error?.message || "Failed to fetch users");
            throw error;
        }
    },

    createUser: async (data: UserFormData): Promise<void> => {
        try {
            const token = await getValidToken();
            const formData = new FormData();
            Object.entries(data).forEach(([key, value]) => {
                if (key === "profileImageFile" && value instanceof File) {
                    formData.append("profileImage", value);
                } else if (value !== undefined && value !== null) {
                    formData.append(key, value.toString());
                }
            });

            await apiClient.post("/TdUsers", formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            toast.success("User created successfully!");
        } catch (error: any) {
            console.error("Failed to create user:", error.response?.data || error);
            toast.error(error.response?.data?.error?.message || "Failed to create user");
            throw error;
        }
    },

    // In apiService.ts
    updateUser: async (id: string, data: UserFormData): Promise<void> => {
        try {
            const token = await getValidToken();
            console.log('updateUser - Token:', token); // Debug
            let profileImageUrl = data.profileImage;
            if (data.profileImageFile instanceof File) {
                const formData = new FormData();
                formData.append("profileImage", data.profileImageFile);
                formData.append("fileType", data.fileType || "profiles");
                const uploadResponse = await apiClient.post("/TdUsers/upload", formData, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data",
                    },
                });
                profileImageUrl = uploadResponse.data.url;
                console.log("Uploaded image URL:", profileImageUrl);
            }
            const dataToSend = { ...data, profileImage: profileImageUrl };
            delete dataToSend.profileImageFile;
            if (!dataToSend.password) {
                delete dataToSend.password;
            }
            console.log("PATCH request - Data to send:", JSON.stringify(dataToSend, null, 2)); // Enhanced debug
            const response = await apiClient.patch(`/TdUsers/${id}`, dataToSend, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
            });
            console.log("PATCH response:", response.data);
            toast.success("User updated successfully!");
        } catch (error: any) {
            console.error(`Failed to update user ${id}:`, error.response?.data || error);
            toast.error(error.response?.data?.error?.message || "Failed to update user");
            throw error;
        }
    },

    deleteUser: async (id: string): Promise<void> => {
        try {
            const token = await getValidToken();
            await apiClient.delete(`/TdUsers/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            toast.success("User deleted successfully!");
        } catch (error: any) {
            console.error(`Failed to delete user ${id}:`, error.response?.data || error);
            toast.error(error.response?.data?.error?.message || "Failed to delete user");
            throw error;
        }
    },

    changeUserStatus: async (id: string, status: "active" | "inactive"): Promise<void> => {
        try {
            const token = await getValidToken();
            await apiClient.post(
                "/TdUsers/changeUserStatus",
                { userId: id, newStatus: status },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            toast.success("User status updated successfully!");
        } catch (error: any) {
            console.error("Failed to change user status:", error.response?.data || error);
            toast.error(error.response?.data?.error?.message || "Failed to change user status");
            throw error;
        }
    },
};