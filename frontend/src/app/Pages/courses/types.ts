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
export interface CourseFormData {
    courseName: string;
    subTitle?: string;
    description?: string;
    pricing: number;
    language: string;
    duration?: string;
    level?: string;
    instructorName?: string;
    rating: number;
    totalRatings: number;
    enrollments: number;
    tags?: string;
    isFeatured: boolean;
    isPublished: boolean;
    modules: {
        topic: string;
        videos: {
            title: string;
            duration: string;
            videoUrl: string;
            description: string;
        }[];
    }[];
    coverImageFile?: File;
    instructorProfileImageFile?: File;
    coverImage?: string; // Add existing image URL
    instructorProfileImage?: string; // Add existing image URL
}

// API service
export const apiService = {
    async getCourses(): Promise<TdCourse[]> {
        try {
            const token = localStorage.getItem("adminToken");
            if (!token) {
                console.error("No admin token found in localStorage");
                toast.error("Authentication token is missing");
                return [];
            }

            // Parse token if it’s stored as JSON, otherwise use it directly
            const authToken = token.startsWith("{") ? JSON.parse(token).id : token;
            // console.log("Using token:", authToken); // Log token for debugging

            const response = await axios.get("http://localhost:3000/api/TdCourses", {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    // Remove Content-Type for GET requests
                },
            });
            const courses = response.data.map((course: any) => ({
                ...course,
                id: course.id,
            }));
            // console.log("Mapped courses:", JSON.stringify(courses, null, 2));
            return courses;
        } catch (error: any) {
            console.error("Failed to fetch courses:", error.response?.status, error.response?.data);
            toast.error("Failed to fetch courses: " + (error.response?.data?.message || error.message));
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
            return { ...response.data, id: response.data.id };
        } catch (error) {
            console.error("Failed to fetch course:", error);
            toast.error("Failed to fetch course");
            throw error;
        }
    },

    async createCourse(formData: CourseFormData) {
        const token = JSON.parse(localStorage.getItem("adminToken") || "{}").id;
        if (!token) {
            const errorMessage = "Authentication token is missing";
            toast.error(errorMessage);
            throw new Error(errorMessage);
        }

        try {
            // Convert fields to match backend schema
            const dataToSend = {
                courseName: formData.courseName,
                subTitle: formData.subTitle || undefined,
                description: formData.description || undefined,
                pricing: Number(formData.pricing) || 0,
                language: formData.language || "English",
                duration: formData.duration || undefined,
                level: formData.level || undefined,
                instructorName: formData.instructorName || undefined,
                rating: Number(formData.rating) || 0,
                totalRatings: Number(formData.totalRatings) || 0,
                enrollments: Number(formData.enrollments) || 0,
                tags: formData.tags ? formData.tags.split(",").map((tag) => tag.trim()) : [],
                isFeatured: formData.isFeatured || false,
                isPublished: formData.isPublished || false,
                modules: formData.modules.map((module, index) => ({
                    index: index + 1,
                    topic: module.topic,
                    videos: module.videos,
                })),
            };

            const formDataWithFiles = new FormData();
            Object.entries(dataToSend).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    if (key === "modules" || key === "tags") {
                        formDataWithFiles.append(key, JSON.stringify(value));
                    } else {
                        formDataWithFiles.append(key, String(value));
                    }
                }
            });
            if (formData.coverImageFile) {
                formDataWithFiles.append("coverImage", formData.coverImageFile);
            }
            if (formData.instructorProfileImageFile) {
                formDataWithFiles.append("instructorProfileImage", formData.instructorProfileImageFile);
            }

            const response = await axios.post("http://localhost:3000/api/TdCourses/createWithFiles", formDataWithFiles, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                },
            });
            console.log('API response:', response.data);
            toast.success("Course created successfully!");
            return response.data;
        } catch (error: any) {
            console.error("Failed to create course:", error);
            const errorMessage = error.response?.data?.error?.message || "Failed to create course";
            toast.error(errorMessage);
            throw new Error(errorMessage);
        }
    },

    async updateCourse(id: string, formData: CourseFormData) {
        const token = JSON.parse(localStorage.getItem('adminToken') || '{}').id;
        if (!token) {
            const errorMessage = 'Authentication token is missing';
            toast.error(errorMessage);
            throw new Error(errorMessage);
        }

        try {
            const dataToSend = {
                courseName: formData.courseName,
                subTitle: formData.subTitle || undefined,
                description: formData.description || undefined,
                pricing: Number(formData.pricing) || 0,
                language: formData.language || 'English',
                duration: formData.duration || undefined,
                level: formData.level || undefined,
                instructorName: formData.instructorName || undefined,
                rating: Number(formData.rating) || 0,
                totalRatings: Number(formData.totalRatings) || 0,
                enrollments: Number(formData.enrollments) || 0,
                tags: formData.tags ? formData.tags.split(',').map((tag) => tag.trim()) : [],
                isFeatured: formData.isFeatured || false,
                isPublished: formData.isPublished || false,
                modules: formData.modules.map((module, index) => ({
                    index: index + 1,
                    topic: module.topic,
                    videos: module.videos,
                })),
                // Only send coverImage if no new file is uploaded
                coverImage: formData.coverImageFile ? undefined : formData.coverImage,
                instructorProfileImage: formData.instructorProfileImageFile ? undefined : formData.instructorProfileImage,
            };

            const formDataWithFiles = new FormData();
            Object.entries(dataToSend).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    if (key === 'modules' || key === 'tags') {
                        formDataWithFiles.append(key, JSON.stringify(value));
                    } else {
                        formDataWithFiles.append(key, String(value));
                    }
                }
            });

            if (formData.coverImageFile) {
                formDataWithFiles.append('coverImage', formData.coverImageFile);
                console.log('Appending coverImage file:', formData.coverImageFile.name);
            }
            if (formData.instructorProfileImageFile) {
                formDataWithFiles.append('instructorProfileImage', formData.instructorProfileImageFile);
                console.log('Appending instructorProfileImage file:', formData.instructorProfileImageFile.name);
            }

            console.log('FormData entries:');
            for (const [key, value] of formDataWithFiles.entries()) {
                console.log(`${key}:`, value);
            }

            const response = await axios.patch(`http://localhost:3000/api/TdCourses/updateWithFiles/${id}`, formDataWithFiles, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                    'Cache-Control': 'no-cache',
                },
            });

            console.log('API response:', JSON.stringify(response.data, null, 2));
            toast.success('Course updated successfully!');
            return response.data;
        } catch (error: any) {
            console.error('Failed to update course:', error);
            const errorMessage = error.response?.data?.error?.message || 'Failed to update course';
            toast.error(errorMessage);
            throw new Error(errorMessage);
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
            console.error("Failed to delete course:", error);
            toast.error("Failed to delete course");
            throw error;
        }
    },
};