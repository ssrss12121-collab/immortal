import axios from 'axios';
import { auth } from './auth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getApi = () => {
    const user = auth.getCurrentUser();
    return axios.create({
        baseURL: API_URL,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${(user as any)?.token}`
        }
    });
};

export const chatApi = {
    getConversations: async () => {
        const api = getApi();
        const response = await api.get('/chat/conversations');
        return response.data.conversations;
    },

    getHistory: async (params: { teamId?: string, targetUserId?: string, before?: string }) => {
        const api = getApi();
        const response = await api.get('/chat/history', { params });
        return response.data.messages;
    },

    markAsRead: async (targetUserId: string) => {
        const api = getApi();
        const response = await api.post('/chat/mark-read', { targetUserId });
        return response.data;
    },

    uploadFile: async (file: File) => {
        const api = getApi();
        const formData = new FormData();
        formData.append('file', file);

        const response = await api.post('/files/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data.data; // Returns saved file doc from R2
    }
};
