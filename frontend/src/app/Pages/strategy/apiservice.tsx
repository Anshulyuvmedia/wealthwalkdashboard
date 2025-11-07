// src/services/apiService.tsx
import axios, { AxiosError } from "axios";
import { toast } from "sonner";
import type { StrategyPayload, TdStrategy } from "./strategyTypes";

interface TokenData {
    id: string;
    ttl: number;
    created: string;
    userId: string;
}

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api",
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});

const getValidToken = async (): Promise<string> => {
    const adminToken = localStorage.getItem("adminToken");
    if (adminToken) {
        try {
            const tokenData: TokenData = JSON.parse(adminToken);
            const expirationDate = new Date(new Date(tokenData.created).getTime() + tokenData.ttl * 1000);
            if (expirationDate > new Date()) {
                return tokenData.id;
            }
        } catch (error) {
            console.error("Error parsing stored token:", error);
            localStorage.removeItem("adminToken");
        }
    }
    throw new Error("No valid token found. Please log in.");
};

apiClient.interceptors.request.use(async (config) => {
    try {
        const token = await getValidToken();
        config.headers.Authorization = `Bearer ${token}`;
    } catch (error) {
        console.error("Interceptor error:", error);
    }
    return config;
});

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem("adminToken");
            window.location.href = "/login";
            toast.error("Session expired. Please log in again.");
        }
        return Promise.reject(error);
    }
);

const transformToTdStrategy = (strategy: StrategyPayload): TdStrategy => {
    const adminToken = localStorage.getItem("adminToken");
    let userId = "";
    if (adminToken) {
        try {
            const tokenData: { id: string; ttl: number; created: string; userId: string } = JSON.parse(adminToken);
            userId = tokenData.userId;
        } catch (error) {
            console.error("Error parsing adminToken:", error);
        }
    }
    return {
        strategyName: strategy.strategyName,
        Duration: strategy.orderSettings.days.join(", ") || "None",
        durationValue: strategy.orderSettings.days.length || 0,
        strategyType: strategy.strategyType,
        pricing: 0,
        createdAt: new Date().toISOString(),
        updateAt: new Date().toISOString(),
        instruments: strategy.instruments,
        orderSettings: strategy.orderSettings,
        orderLegs: strategy.orderLegs,
        optionPositionBuilder: strategy.optionPositionBuilder,
        entryConditions: strategy.entryConditions,
        exitConditions: strategy.exitConditions,
        riskManagement: strategy.riskManagement,
        userId,
    };
};

export const apiService = {
    getStrategys: async (): Promise<TdStrategy[]> => {
        try {
            const token = await getValidToken();
            const response = await apiClient.get<TdStrategy[]>("/TdStrategys", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            console.log('Strategy res: ', response.data);
            return response.data;
        } catch (error) {
            const err = error as AxiosError;
            const errorMessage = err.response?.data?.error?.message || "Failed to fetch strategies";
            console.error("Error fetching strategies:", err);
            toast.error(errorMessage);
            throw new Error(errorMessage);
        }
    },

    getStrategy: async (id: string): Promise<TdStrategy> => {
        try {
            const token = await getValidToken();
            const response = await apiClient.get<TdStrategy>(`/TdStrategys/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            // console.log('getStrategy:', response.data);
            return response.data;
        } catch (error) {
            const err = error as AxiosError;
            const errorMessage = err.response?.data?.error?.message || "Failed to fetch strategy";
            console.error(`Error fetching strategy ${id}:`, err);
            toast.error(errorMessage);
            throw new Error(errorMessage);
        }
    },

    createStrategy: async (strategy: StrategyPayload): Promise<TdStrategy> => {
        try {
            const token = await getValidToken();
            const payload = transformToTdStrategy(strategy);
            console.log("Sending payload:", JSON.stringify(payload, null, 2));
            const response = await apiClient.post<TdStrategy>("/TdStrategys", payload, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            toast.success(`Strategy "${response.data.strategyName}" created successfully!`);
            return response.data;
        } catch (error) {
            const err = error as AxiosError;
            const errorMessage = err.response?.data?.error?.message || "Authorization Required";
            console.error("Error creating strategy:", err);
            toast.error(errorMessage);
            throw new Error(errorMessage);
        }
    },

    updateStrategy: async (id: string, strategy: Partial<StrategyPayload>): Promise<TdStrategy> => {
        try {
            const token = await getValidToken();
            const payload = transformToTdStrategy(strategy as StrategyPayload);
            const response = await apiClient.put<TdStrategy>(`/TdStrategys/${id}`, payload, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            toast.success(`Strategy "${response.data.strategyName}" updated successfully!`);
            return response.data;
        } catch (error) {
            const err = error as AxiosError;
            const errorMessage = err.response?.data?.error?.message || "Failed to update strategy";
            console.error(`Error updating strategy ${id}:`, err);
            toast.error(errorMessage);
            throw new Error(errorMessage);
        }
    },

    deleteStrategy: async (id: string): Promise<void> => {
        try {
            const token = await getValidToken();
            await apiClient.delete(`/TdStrategys/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            toast.success("Strategy deleted successfully!");
        } catch (error) {
            const err = error as AxiosError;
            const errorMessage = err.response?.data?.error?.message || "Failed to delete strategy";
            console.error(`Error deleting strategy ${id}:`, err);
            toast.error(errorMessage);
            throw new Error(errorMessage);
        }
    },
};

export default apiService;