import axios from 'axios';
import { Notification } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

export const getNotifications = async (userId: string): Promise<Notification[]> => {
    const response = await api.get(`/notifications/${userId}`);
    return response.data.notifications;
};

export const markAsRead = async (id: string) => {
    const response = await api.post(`/notifications/read/${id}`);
    return response.data.success;
};

export const deleteNotification = async (id: string) => {
    const response = await api.delete(`/notifications/${id}`);
    return response.data.success;
};

export const addNotification = async (notif: Partial<Notification>) => {
    const response = await api.post('/notifications/send', notif);
    return response.data.notification;
};

export const broadcastNotification = async (notif: Partial<Notification>) => {
    const response = await api.post('/notifications/broadcast', notif);
    return response.data.count;
};
