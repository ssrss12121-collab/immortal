import axios from 'axios';
import { Challenge, UserProfile } from '../types';
import { getCachedData, setCachedData } from './cacheService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

export const getChallenges = async (ignoreCache = false): Promise<Challenge[]> => {
    if (!ignoreCache) {
        const cached = getCachedData('challenges_list');
        if (cached) return cached;
    }
    const response = await api.get('/challenges');
    setCachedData('challenges_list', response.data.challenges);
    return response.data.challenges;
};

export const createChallenge = async (challenge: Partial<Challenge>, userProfile?: UserProfile): Promise<{ success: boolean; message: string }> => {
    const response = await api.post('/challenges/create', {
        ...challenge,
        challengerName: userProfile?.ign || 'Unknown',
        challengerRole: userProfile?.role || 'Rusher'
    });
    return response.data;
};

export const acceptChallenge = async (challengeId: string, userProfile?: UserProfile): Promise<{ success: boolean; message: string }> => {
    const response = await api.post('/challenges/accept', {
        challengeId,
        acceptorId: userProfile?.id,
        acceptorName: userProfile?.ign,
        acceptorRole: userProfile?.role
    });
    return response.data;
};

export const deleteChallenge = async (id: string): Promise<boolean> => {
    const response = await api.delete(`/challenges/${id}`);
    return response.data.success;
};

export const saveChallenge = async (challenge: Challenge): Promise<boolean> => {
    try {
        const response = await api.post(`/challenges/update/${challenge.id}`, challenge);
        return response.data.success;
    } catch (err) {
        console.error("Failed to save challenge", err);
        return false;
    }
};
