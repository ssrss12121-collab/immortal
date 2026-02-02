
import axios from 'axios';
import { MembershipPlan } from '../types';
import { getCachedData, setCachedData } from './cacheService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

export const getMembershipPlans = async (ignoreCache = false): Promise<MembershipPlan[]> => {
    if (!ignoreCache) {
        const cached = getCachedData('membership_plans');
        if (cached) return cached;
    }
    const response = await api.get('/memberships/plans');
    setCachedData('membership_plans', response.data.plans);
    return response.data.plans;
};

export const addMembershipPlan = async (plan: Partial<MembershipPlan>) => {
    const response = await api.post('/memberships/plans/add', plan);
    return response.data;
};

export const updateMembershipPlan = async (id: string, plan: Partial<MembershipPlan>) => {
    const response = await api.patch(`/memberships/plans/${id}`, plan);
    return response.data;
};

export const deleteMembershipPlan = async (id: string) => {
    const response = await api.delete(`/memberships/plans/${id}`);
    return response.data;
};
