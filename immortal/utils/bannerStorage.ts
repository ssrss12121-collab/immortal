import axios from 'axios';
import { Banner } from '../types';
import { getCachedData, setCachedData } from './cacheService';
export type { Banner };

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

export const getBanners = async (ignoreCache = false): Promise<Banner[]> => {
    if (!ignoreCache) {
        const cached = getCachedData('banners_list');
        if (cached) return cached;
    }
    const response = await api.get('/banners');
    setCachedData('banners_list', response.data.banners);
    return response.data.banners;
};

export const addBanner = async (banner: Partial<Banner>) => {
    const response = await api.post('/banners/add', banner);
    return response.data.success;
};

export const deleteBanner = async (id: string) => {
    const response = await api.delete(`/banners/${id}`);
    return response.data.success;
};

export const updateBanner = async (id: string, banner: Partial<Banner>) => {
    const response = await api.post(`/banners/update/${id}`, banner);
    return response.data.success;
};
