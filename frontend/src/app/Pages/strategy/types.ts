import axios from "axios";
import { toast } from "sonner";

export interface TdStrategy {
    id?: string;
    strategyName: string;
    Duration: string;
    durationValue: number;
    fetures: { title: string; enabled: boolean }[];
    pricing: number;
    createdAt: string;
    updateAt: string;
}

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api",
    headers: {
        "Content-Type": "application/json",
    },
});

export const apiService = {
    getStrategys: async (): Promise<TdStrategy[]> => {
        try {
            const response = await apiClient.get("/TdStrategys");
            return response.data.map((strategy: any) => ({
                id: strategy.id,
                strategyName: strategy.strategyName,
                Duration: strategy.Duration,
                durationValue: strategy.durationValue,
                fetures: strategy.fetures, // Now an array of { title: string; enabled: boolean }
                pricing: strategy.pricing,
                createdAt: strategy.createdAt,
                updateAt: strategy.updateAt,
            }));
        } catch (error) {
            console.error("Error fetching strategys from API:", error);
            toast.error("Failed to fetch strategys");
            throw error;
        }
    },

    getStrategy: async (id: string): Promise<TdStrategy> => {
        try {
            const response = await apiClient.get(`/TdStrategys/${id}`);
            return {
                id: response.data.id,
                strategyName: response.data.strategyName,
                Duration: response.data.Duration,
                durationValue: response.data.durationValue,
                fetures: response.data.fetures,
                pricing: response.data.pricing,
                createdAt: response.data.createdAt,
                updateAt: response.data.updateAt,
            };
        } catch (error) {
            console.error(`Error fetching strategy ${id}:`, error);
            toast.error("Failed to fetch strategy");
            throw error;
        }
    },

    createStrategy: async (strategy: TdStrategy): Promise<TdStrategy> => {
        try {
            const response = await apiClient.post("/TdStrategys", strategy);
            return {
                id: response.data.id,
                strategyName: response.data.strategyName,
                Duration: response.data.Duration,
                durationValue: response.data.durationValue,
                fetures: response.data.fetures,
                pricing: response.data.pricing,
                createdAt: response.data.createdAt,
                updateAt: response.data.updateAt,
            };
        } catch (error) {
            console.error("Error creating strategy:", error);
            toast.error("Failed to create strategy");
            throw error;
        }
    },

    updateStrategy: async (id: string, strategy: Partial<TdStrategy>): Promise<TdStrategy> => {
        try {
            const response = await apiClient.put(`/TdStrategys/${id}`, strategy);
            return {
                id: response.data.id,
                strategyName: response.data.strategyName,
                Duration: response.data.Duration,
                durationValue: response.data.durationValue,
                fetures: response.data.fetures,
                pricing: response.data.pricing,
                createdAt: response.data.createdAt,
                updateAt: response.data.updateAt,
            };
        } catch (error) {
            console.error(`Error updating strategy ${id}:`, error);
            toast.error("Failed to update strategy");
            throw error;
        }
    },

    deleteStrategy: async (id: string): Promise<void> => {
        try {
            await apiClient.delete(`/TdStrategys/${id}`);
            toast.success("Strategy deleted successfully!");
        } catch (error) {
            console.error(`Error deleting strategy ${id}:`, error);
            toast.error("Failed to delete strategy");
            throw error;
        }
    },
};