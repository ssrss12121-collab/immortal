import axios from 'axios';
import { AdminUser } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

export type { AdminUser };

export const getAllAdmins = async () => {
    const response = await api.get('/admins/admins');
    return response.data.admins;
};

export const createAdmin = async (adminData: any) => {
    const response = await api.post('/admins/create', adminData);
    return response.data.admin;
};

export const deleteAdmin = async (id: string) => {
    const response = await api.delete(`/admins/${id}`);
    return response.data.success;
};

export const getAdminStats = async () => {
    const response = await api.get('/admins/stats');
    return response.data.stats;
};
