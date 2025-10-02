// types.ts (or wherever apiService is defined - assuming it's exported here)
import axios from "axios";
import { toast } from "sonner";

// Signal interface
export interface TdSignal {
    id?: string | number;  // API uses string, display as number
    signalType: string;
    category: string;
    stockName: string;
    marketSentiments: string;
    entry: number;
    target: number;
    stopLoss: number;
    exit: number;
    tradeType: string;
    Strategy: string;
    createdAt: string;
    updatedAt: string;
}

// Form data interface for create/update (fixed 'sector' to 'category')
export interface SignalFormData {
    signalType: string;
    category: string;  // Fixed from 'sector'
    stockName: string;
    marketSentiments: string;
    entry: number;
    target: number;
    stopLoss: number;
    exit: number;
    tradeType: string;
    Strategy: string;
}

// Create Axios instance...
const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api",
    headers: {
        "Content-Type": "application/json",
    },
});

export const apiService = {
    async getSignals(): Promise<TdSignal[]> {
        try {
            const token = localStorage.getItem("adminToken");
            if (!token) {
                console.error("No admin token found in localStorage");
                toast.error("Authentication token is missing");
                return [];
            }

            const authToken = token.startsWith("{") ? JSON.parse(token).id : token;

            const response = await apiClient.get("/TdSignals", {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            });
            const signals = response.data.map((signal: any) => ({
                ...signal,
                id: signal.id,  // string from API
            }));
            return signals;
        } catch (error: any) {
            console.error("Failed to fetch signals:", error.response?.status, error.response?.data);
            toast.error("Failed to fetch signals: " + (error.response?.data?.message || error.message));
            return [];
        }
    },

    async getSignal(id: string): Promise<TdSignal> {
        try {
            const token = JSON.parse(localStorage.getItem("adminToken") || "{}").id;
            const response = await apiClient.get(`/TdSignals/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return { ...response.data, id: response.data.id };
        } catch (error) {
            console.error("Failed to fetch signal:", error);
            toast.error("Failed to fetch signal");
            throw error;
        }
    },

    async createSignal(formData: SignalFormData) {
        const token = JSON.parse(localStorage.getItem("adminToken") || "{}").id;
        if (!token) {
            const errorMessage = "Authentication token is missing";
            toast.error(errorMessage);
            throw new Error(errorMessage);
        }

        try {
            const dataToSend = {
                ...formData,
                entry: Number(formData.entry) || 0,
                target: Number(formData.target) || 0,
                stopLoss: Number(formData.stopLoss) || 0,
                exit: Number(formData.exit) || 0,
            };

            const response = await apiClient.post("/TdSignals", dataToSend, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            console.log('API response:', response.data);
            toast.success("Signal created successfully!");
            return response.data;
        } catch (error: any) {
            console.error("Failed to create signal:", error);
            const errorMessage = error.response?.data?.error?.message || "Failed to create signal";
            toast.error(errorMessage);
            throw new Error(errorMessage);
        }
    },

    async updateSignal(id: string, formData: SignalFormData) {
        const token = JSON.parse(localStorage.getItem('adminToken') || '{}').id;
        if (!token) {
            const errorMessage = 'Authentication token is missing';
            toast.error(errorMessage);
            throw new Error(errorMessage);
        }

        try {
            const dataToSend = {
                ...formData,
                entry: Number(formData.entry) || 0,
                target: Number(formData.target) || 0,
                stopLoss: Number(formData.stopLoss) || 0,
                exit: Number(formData.exit) || 0,
            };

            const response = await apiClient.patch(`/TdSignals/${id}`, dataToSend, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Cache-Control': 'no-cache',
                },
            });

            console.log('API response:', JSON.stringify(response.data, null, 2));
            toast.success('Signal updated successfully!');
            return response.data;
        } catch (error: any) {
            console.error('Failed to update signal:', error);
            const errorMessage = error.response?.data?.error?.message || 'Failed to update signal';
            toast.error(errorMessage);
            throw new Error(errorMessage);
        }
    },

    async deleteSignal(id: string) {
        const token = JSON.parse(localStorage.getItem("adminToken") || "{}").id;
        try {
            await apiClient.delete(`/TdSignals/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            toast.success("Signal deleted successfully!");
        } catch (error) {
            console.error("Failed to delete signal:", error);
            toast.error("Failed to delete signal");
            throw error;
        }
    },
};