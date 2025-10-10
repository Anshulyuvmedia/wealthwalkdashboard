import axios from 'axios';
import { toast } from 'sonner';
import type { UserFormData } from './interfaces';

const apiClient = axios.create({
    baseURL: 'http://localhost:3000/api',
    headers: {
        Accept: 'application/json', // Keep Accept header for JSON responses
    },
});

let adminToken: string | null = localStorage.getItem('adminToken');

interface TokenData {
    id: string;
    ttl: number;
    created: string;
    userId: string;
}

const getValidToken = async (): Promise<string> => {
    if (adminToken) {
        console.log('Stored adminToken:', adminToken);
        try {
            const tokenData: TokenData = JSON.parse(adminToken);
            console.log('Parsed tokenData:', tokenData);
            const expirationDate = new Date(new Date(tokenData.created).getTime() + tokenData.ttl * 1000);
            console.log('Token expiration:', expirationDate);
            if (expirationDate > new Date()) {
                console.log('Token validated successfully:', tokenData.id);
                return tokenData.id;
            }
        } catch (error) {
            console.error('Error parsing stored token:', error);
            localStorage.removeItem('adminToken');
            adminToken = null;
        }
    }
    throw new Error('No valid token found. Please log in.');
};

const apiService = {
    getUsers: async (page: number, pageSize: number, search?: string): Promise<any> => {
        try {
            const token = await getValidToken();
            const response = await apiClient.get('/TdUsers', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                params: {
                    filter: JSON.stringify({
                        where: search ? { contactName: { like: search, options: 'i' } } : {},
                        skip: (page - 1) * pageSize,
                        limit: pageSize,
                    }),
                },
            });
            return response.data;
        } catch (error: any) {
            console.error('Failed to fetch users:', error.response?.data || error);
            if (error.message === 'No valid token found. Please log in.') {
                toast.error('Session expired. Please log in again.');
                window.location.href = '/login';
            } else {
                toast.error(error.response?.data?.error?.message || 'Failed to fetch users');
            }
            throw error;
        }
    },

    getUserById: async (id: string): Promise<any> => {
        try {
            const token = await getValidToken();
            const response = await apiClient.get(`/TdUsers/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (error: any) {
            console.error(`Failed to fetch user ${id}:`, error.response?.data || error);
            if (error.message === 'No valid token found. Please log in.') {
                toast.error('Session expired. Please log in again.');
                window.location.href = '/login';
            } else {
                toast.error(error.response?.data?.error?.message || 'Failed to fetch user');
            }
            throw error;
        }
    },

    updateUser: async (id: string, data: UserFormData): Promise<void> => {
        try {
            const token = await getValidToken();
            console.log('updateUser - Token:', token);
            let profileImageUrl = data.profileImage || null;
            if (data.profileImageFile instanceof File) {
                const formData = new FormData();
                formData.append('profileImage', data.profileImageFile);
                formData.append('fileType', data.fileType || 'profiles');
                console.log('updateUser - FormData contents:');
                for (const pair of formData.entries()) {
                    console.log(`${pair[0]}: ${pair[1]}`);
                }
                try {
                    const uploadResponse = await apiClient.post('/TdUsers/upload', formData, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            // No Content-Type; let browser set it with boundary
                        },
                    });
                    console.log('updateUser - Upload response:', uploadResponse.data);
                    profileImageUrl = uploadResponse.data.url;
                    if (!profileImageUrl) {
                        throw new Error('Upload endpoint did not return a valid URL');
                    }
                    console.log('updateUser - Uploaded image URL:', profileImageUrl);
                } catch (uploadError: any) {
                    console.error('updateUser - Upload failed:', uploadError.response?.data || uploadError);
                    toast.error(uploadError.response?.data?.error?.message || 'File upload failed');
                    throw uploadError; // Bubble up to stop the patch
                }
            }
            const dataToSend = { ...data, profileImage: profileImageUrl };
            delete dataToSend.profileImageFile;
            delete dataToSend.phone; // Avoid phone updates
            if (!dataToSend.password) {
                delete dataToSend.password;
            }
            console.log('updateUser - Data to send:', JSON.stringify(dataToSend, null, 2));
            const response = await apiClient.patch(`/TdUsers/${id}`, dataToSend, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
            });
            console.log('updateUser - PATCH response:', response.data);
            toast.success('User updated successfully!');
        } catch (error: any) {
            console.error('updateUser - Error:', error.response?.data || error);
            if (error.message === 'No valid token found. Please log in.') {
                toast.error('Session expired. Please log in again.');
                window.location.href = '/login';
            } else if (error.response?.status === 400) {
                toast.error(error.response?.data?.error?.message || 'Invalid file or request');
            } else {
                toast.error(error.response?.data?.error?.message || 'Failed to update user');
            }
            throw error;
        }
    },

    resetUserPassword: async (userId: string): Promise<void> => {
        try {
            const token = await getValidToken();
            const response = await apiClient.post(
                `/TdUsers/resetUserPassFromPanel`,
                { userId },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            toast.success(response.data);
        } catch (error: any) {
            console.error('Failed to reset password:', error.response?.data || error);
            if (error.message === 'No valid token found. Please log in.') {
                toast.error('Session expired. Please log in again.');
                window.location.href = '/login';
            } else {
                toast.error(error.response?.data?.error?.message || 'Failed to reset password');
            }
            throw error;
        }
    },

    changeUserStatus: async (userId: string, newStatus: string): Promise<void> => {
        try {
            const token = await getValidToken();
            const response = await apiClient.post(
                `/TdUsers/changeUserStatus`,
                { userId, newStatus },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            toast.success(response.data);
        } catch (error: any) {
            console.error('Failed to change user status:', error.response?.data || error);
            if (error.message === 'No valid token found. Please log in.') {
                toast.error('Session expired. Please log in again.');
                window.location.href = '/login';
            } else {
                toast.error(error.response?.data?.error?.message || 'Failed to change user status');
            }
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
            toast.success('User deleted successfully!');
        } catch (error: any) {
            console.error(`Failed to delete user ${id}:`, error.response?.data || error);
            if (error.message === 'No valid token found. Please log in.') {
                toast.error('Session expired. Please log in again.');
                window.location.href = '/login';
            } else {
                toast.error(error.response?.data?.error?.message || 'Failed to delete user');
            }
            throw error;
        }
    },
};

export default apiService;