import axios from "axios";
import { toast } from "sonner";
import type { TdUser, UserFormData } from "./interfaces";

export const apiService = {
    async getUsers(): Promise<TdUser[]> {
        try {
            const token = JSON.parse(localStorage.getItem("adminToken") || "{}").id;
            const response = await axios.get("http://localhost:3000/api/TdUsers", {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data.filter((user: TdUser) => user.userType !== "admin");
        } catch (error) {
            console.error("Failed to fetch users:", error);
            toast.error("Failed to fetch users");
            return [];
        }
    },

    async createUser(formData: UserFormData) {
        const token = JSON.parse(localStorage.getItem("adminToken") || "{}").id;
        try {
            const dataToSend = { ...formData };
            if (formData.profileImageFile) {
                const formDataWithFile = new FormData();
                Object.entries(dataToSend).forEach(([key, value]) => {
                    if (key !== "profileImageFile" && value !== undefined) {
                        formDataWithFile.append(key, value as string);
                    }
                });
                formDataWithFile.append("profileImage", formData.profileImageFile);
                await axios.post("http://localhost:3000/api/TdUsers", formDataWithFile, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data",
                    },
                });
            } else {
                await axios.post("http://localhost:3000/api/TdUsers", dataToSend, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });
            }
            toast.success("User created successfully!");
        } catch (error) {
            toast.error("Failed to create user");
            throw error;
        }
    },

    async updateUser(id: string, formData: UserFormData) {
        const token = JSON.parse(localStorage.getItem("adminToken") || "{}").id;
        try {
            const dataToSend = { ...formData };
            if (formData.profileImageFile) {
                const formDataWithFile = new FormData();
                Object.entries(dataToSend).forEach(([key, value]) => {
                    if (key !== "profileImageFile" && value !== undefined) {
                        formDataWithFile.append(key, value as string);
                    }
                });
                formDataWithFile.append("profileImage", formData.profileImageFile);
                await axios.patch(`http://localhost:3000/api/TdUsers/${id}`, formDataWithFile, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data",
                    },
                });
            } else {
                await axios.patch(`http://localhost:3000/api/TdUsers/${id}`, dataToSend, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });
            }
            toast.success("User updated successfully!");
        } catch (error) {
            toast.error("Failed to update user");
            throw error;
        }
    },

    async deleteUser(id: string) {
        const token = JSON.parse(localStorage.getItem("adminToken") || "{}").id;
        try {
            await axios.delete(`http://localhost:3000/api/TdUsers/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            toast.success("User deleted successfully!");
        } catch (error) {
            toast.error("Failed to delete user");
            throw error;
        }
    },

    async toggleUserStatus(id: string, status: "active" | "inactive") {
        const token = JSON.parse(localStorage.getItem("adminToken") || "{}").id;
        try {
            await axios.patch(
                `http://localhost:3000/api/TdUsers/${id}`,
                { status },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );
            toast.success(`User status updated to ${status}`);
        } catch (error) {
            toast.error("Failed to update user status");
            throw error;
        }
    },
};