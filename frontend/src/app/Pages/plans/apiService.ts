import axios from "axios";
import { toast } from "sonner";
import type { TdPlan } from "./types";

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api",
    headers: {
        "Content-Type": "application/json",
    },
});

export const apiService = {
    getPlans: async (): Promise<TdPlan[]> => {
        try {
            const response = await apiClient.get("/TdPlans");
            return response.data.map((plan: any) => ({
                id: plan.id,
                planName: plan.planName,
                Duration: plan.Duration,
                durationValue: plan.durationValue,
                fetures: plan.fetures, // Now an array of { title: string; enabled: boolean }
                pricing: plan.pricing,
                createdAt: plan.createdAt,
                updateAt: plan.updateAt,
            }));
        } catch (error) {
            console.error("Error fetching plans from API:", error);
            toast.error("Failed to fetch plans");
            throw error;
        }
    },

    getPlan: async (id: string): Promise<TdPlan> => {
        try {
            const response = await apiClient.get(`/TdPlans/${id}`);
            return {
                id: response.data.id,
                planName: response.data.planName,
                Duration: response.data.Duration,
                durationValue: response.data.durationValue,
                fetures: response.data.fetures,
                pricing: response.data.pricing,
                createdAt: response.data.createdAt,
                updateAt: response.data.updateAt,
            };
        } catch (error) {
            console.error(`Error fetching plan ${id}:`, error);
            toast.error("Failed to fetch plan");
            throw error;
        }
    },

    createPlan: async (plan: TdPlan): Promise<TdPlan> => {
        try {
            const response = await apiClient.post("/TdPlans", plan);
            return {
                id: response.data.id,
                planName: response.data.planName,
                Duration: response.data.Duration,
                durationValue: response.data.durationValue,
                fetures: response.data.fetures,
                pricing: response.data.pricing,
                createdAt: response.data.createdAt,
                updateAt: response.data.updateAt,
            };
        } catch (error) {
            console.error("Error creating plan:", error);
            toast.error("Failed to create plan");
            throw error;
        }
    },

    updatePlan: async (id: string, plan: Partial<TdPlan>): Promise<TdPlan> => {
        try {
            const response = await apiClient.put(`/TdPlans/${id}`, plan);
            return {
                id: response.data.id,
                planName: response.data.planName,
                Duration: response.data.Duration,
                durationValue: response.data.durationValue,
                fetures: response.data.fetures,
                pricing: response.data.pricing,
                createdAt: response.data.createdAt,
                updateAt: response.data.updateAt,
            };
        } catch (error) {
            console.error(`Error updating plan ${id}:`, error);
            toast.error("Failed to update plan");
            throw error;
        }
    },

    deletePlan: async (id: string): Promise<void> => {
        try {
            await apiClient.delete(`/TdPlans/${id}`);
            toast.success("Plan deleted successfully!");
        } catch (error) {
            console.error(`Error deleting plan ${id}:`, error);
            toast.error("Failed to delete plan");
            throw error;
        }
    },
};