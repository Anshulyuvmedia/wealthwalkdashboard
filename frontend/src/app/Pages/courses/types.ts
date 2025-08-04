import axios from "axios";
import { toast } from "sonner";

// Course interface based on TdCourse schema
export interface TdCourse {
    id: string;
    courseName: string;
    subTitle?: string;
    description?: string;
    coverImage?: string;
    pricing: number;
    language: string;
    duration?: string;
    level?: string;
    instructorName?: string;
    instructorProfileImage?: string;
    rating: number;
    totalRatings: number;
    enrollments: number;
    tags?: string[];
    isFeatured: boolean;
    isPublished: boolean;
    modules?: {
        index: number;
        topic: string;
        videos: {
            title: string;
            duration: string;
            videoUrl: string;
            description: string;
        }[];
    }[];
    createdAt: string;
    updatedAt: string;
}

// Form data interface for create/update
export interface CourseFormData extends Partial<TdCourse> {
    coverImageFile?: File;
    instructorProfileImageFile?: File;
    tagsInput?: string; // Comma-separated string for tags
}

// API service
export const apiService = {
    async getCourses(): Promise<TdCourse[]> {
        try {
            const token = JSON.parse(localStorage.getItem("adminToken") || "{}").id;
            const response = await axios.get("http://localhost:3000/api/TdCourses", {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (error) {
            console.error("Failed to fetch courses:", error);
            toast.error("Failed to fetch courses");
            return [];
        }
    },

    async getCourse(id: string): Promise<TdCourse> {
        try {
            const token = JSON.parse(localStorage.getItem("adminToken") || "{}").id;
            const response = await axios.get(`http://localhost:3000/api/TdCourses/${id}`, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (error) {
            console.error("Failed to fetch course:", error);
            toast.error("Failed to fetch course");
            throw error;
        }
    },

    async createCourse(formData: CourseFormData) {
        const token = JSON.parse(localStorage.getItem("adminToken") || "{}").id;
        try {
            const dataToSend = {
                ...formData,
                tags: formData.tagsInput ? formData.tagsInput.split(",").map((tag) => tag.trim()) : [],
            };
            delete dataToSend.tagsInput;
            delete dataToSend.coverImageFile;
            delete dataToSend.instructorProfileImageFile;

            if (formData.coverImageFile || formData.instructorProfileImageFile) {
                const formDataWithFiles = new FormData();
                Object.entries(dataToSend).forEach(([key, value]) => {
                    if (value !== undefined) {
                        formDataWithFiles.append(key, typeof value === "object" ? JSON.stringify(value) : value);
                    }
                });
                if (formData.coverImageFile) {
                    formDataWithFiles.append("coverImage", formData.coverImageFile);
                }
                if (formData.instructorProfileImageFile) {
                    formDataWithFiles.append("instructorProfileImage", formData.instructorProfileImageFile);
                }
                await axios.post("http://localhost:3000/api/TdCourses", formDataWithFiles, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data",
                    },
                });
            } else {
                await axios.post("http://localhost:3000/api/TdCourses", dataToSend, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });
            }
            toast.success("Course created successfully!");
        } catch (error) {
            toast.error("Failed to create course");
            throw error;
        }
    },

    async updateCourse(id: string, formData: CourseFormData) {
        const token = JSON.parse(localStorage.getItem("adminToken") || "{}").id;
        try {
            const dataToSend = {
                ...formData,
                tags: formData.tagsInput ? formData.tagsInput.split(",").map((tag) => tag.trim()) : [],
            };
            delete dataToSend.tagsInput;
            delete dataToSend.coverImageFile;
            delete dataToSend.instructorProfileImageFile;

            if (formData.coverImageFile || formData.instructorProfileImageFile) {
                const formDataWithFiles = new FormData();
                Object.entries(dataToSend).forEach(([key, value]) => {
                    if (value !== undefined) {
                        formDataWithFiles.append(key, typeof value === "object" ? JSON.stringify(value) : value);
                    }
                });
                if (formData.coverImageFile) {
                    formDataWithFiles.append("coverImage", formData.coverImageFile);
                }
                if (formData.instructorProfileImageFile) {
                    formDataWithFiles.append("instructorProfileImage", formData.instructorProfileImageFile);
                }
                await axios.patch(`http://localhost:3000/api/TdCourses/${id}`, formDataWithFiles, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data",
                    },
                });
            } else {
                await axios.patch(`http://localhost:3000/api/TdCourses/${id}`, dataToSend, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });
            }
            toast.success("Course updated successfully!");
        } catch (error) {
            toast.error("Failed to update course");
            throw error;
        }
    },

    async deleteCourse(id: string) {
        const token = JSON.parse(localStorage.getItem("adminToken") || "{}").id;
        try {
            await axios.delete(`http://localhost:3000/api/TdCourses/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            toast.success("Course deleted successfully!");
        } catch (error) {
            toast.error("Failed to delete course");
            throw error;
        }
    },
};