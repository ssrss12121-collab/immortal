import axios from 'axios';
import { NewsItem, MVPItem } from '../types';
import { getCachedData, setCachedData } from './cacheService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

export const getNews = async (ignoreCache = false): Promise<NewsItem[]> => {
    if (!ignoreCache) {
        const cached = getCachedData('news_feed');
        if (cached) return cached;
    }
    const response = await api.get('/news');
    setCachedData('news_feed', response.data.news);
    return response.data.news;
};

export const addNews = async (news: Omit<NewsItem, 'id' | 'date'>) => {
    const response = await api.post('/news/add', news);
    return response.data.success;
};

export const deleteNews = async (id: string) => {
    const response = await api.delete(`/news/${id}`);
    return response.data.success;
};

export const updateNewsItem = async (id: string, news: Partial<NewsItem>) => {
    const response = await api.post(`/news/update/${id}`, news);
    return response.data.success;
};

export const getMVPs = async (ignoreCache = false): Promise<MVPItem[]> => {
    if (!ignoreCache) {
        const cached = getCachedData('mvp_spotlight');
        if (cached) return cached;
    }
    const response = await api.get('/mvps');
    setCachedData('mvp_spotlight', response.data.mvps);
    return response.data.mvps;
};

export const addMVP = async (mvp: Omit<MVPItem, 'id'>) => {
    const response = await api.post('/mvps/add', mvp);
    return response.data.success;
};

export const deleteMVP = async (id: string) => {
    const response = await api.delete(`/mvps/${id}`);
    return response.data.success;
};

export const updateMVPItem = async (id: string, mvp: Partial<MVPItem>) => {
    const response = await api.post(`/mvps/update/${id}`, mvp);
    return response.data.success;
};

export const getTerms = async (): Promise<string> => {
    try {
        const response = await api.get('/system/settings/app_terms_content');
        return response.data.value || "No terms and conditions have been published yet.";
    } catch (error) {
        console.error("Failed to fetch terms", error);
        return "No terms and conditions have been published yet.";
    }
};

export const saveTerms = async (content: string) => {
    try {
        const response = await api.post('/system/settings/update', {
            key: 'app_terms_content',
            value: content
        });
        return response.data.success;
    } catch (error) {
        console.error("Failed to save terms", error);
        return false;
    }
};
