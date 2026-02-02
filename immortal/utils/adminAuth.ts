import axios from 'axios';
import { AdminUser } from '../types'; // Ensure AdminUser is defined and exported in types.ts

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

export const loginAdmin = async (email: string, password: string): Promise<AdminUser | null> => {
    try {
        const response = await api.post('/admins/login', { email, password });
        const { admin, success } = response.data;

        if (success && admin) {
            localStorage.setItem('current_admin_session', JSON.stringify(admin));
            return admin;
        }
        return null;
    } catch (error) {
        console.error('Admin login failed:', error);
        return null;
    }
};

export const getCurrentAdmin = (): AdminUser | null => {
    const stored = localStorage.getItem('current_admin_session');
    if (!stored) return null;
    try {
        return JSON.parse(stored);
    } catch {
        return null;
    }
};

export const logoutAdmin = () => {
    localStorage.removeItem('current_admin_session');
    window.location.href = '/admin-login';
};

export const isSuperAdmin = (): boolean => {
    const admin = getCurrentAdmin();
    return admin?.role === 'super_admin';
};
