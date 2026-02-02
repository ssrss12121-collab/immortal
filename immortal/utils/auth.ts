import axios from 'axios';
import { UserProfile } from '../types';
import { getCachedData, setCachedData } from './cacheService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

export const auth = {
    login: async (email: string, password: string): Promise<UserProfile> => {
        const response = await api.post('/auth/login', { email, password });
        const { user, success, message } = response.data;

        if (!success) throw new Error(message || 'Login failed');

        auth.saveSession(user);
        return user;
    },

    guestLogin: async (): Promise<UserProfile> => {
        const response = await api.post('/auth/guest-login');
        const { user, success, message } = response.data;

        if (!success) throw new Error(message || 'Guest login failed');

        auth.saveSession(user);
        return user;
    },

    register: async (userData: any): Promise<UserProfile> => {
        const response = await api.post('/auth/register', userData);
        const { user, success, message } = response.data;

        if (!success) throw new Error(message || 'Registration failed');

        auth.saveSession(user);
        return user;
    },

    isGuest: (user?: UserProfile): boolean => {
        return user?.role === 'Guest';
    },

    logout: () => {
        localStorage.removeItem('battle_arena_user');
        localStorage.removeItem('current_admin_session');
        window.location.href = '/login';
    },

    getCurrentUser: (): UserProfile | null => {
        const stored = localStorage.getItem('battle_arena_user');
        if (!stored) return null;
        try {
            return JSON.parse(stored);
        } catch {
            return null;
        }
    },

    updateProfile: async (data: Partial<UserProfile>): Promise<UserProfile> => {
        const currentUser = auth.getCurrentUser();
        if (!currentUser) throw new Error('Not logged in');

        const response = await api.post(`/users/update/${currentUser.id}`, data, {
            headers: { Authorization: `Bearer ${(currentUser as any).token}` }
        });

        const { user, success, message } = response.data;
        if (!success) throw new Error(message || 'Update failed');

        auth.saveSession(user);
        return user;
    },

    saveSession: (user: UserProfile) => {
        localStorage.setItem('battle_arena_user', JSON.stringify(user));
        window.dispatchEvent(new Event('user-session-update'));
    },

    refreshSession: async (): Promise<UserProfile | null> => {
        const current = auth.getCurrentUser();
        if (!current) return null;
        try {
            // Determine ID (handle _id vs id inconsistency)
            const id = current.id || (current as any)._id;
            if (!id) return null;

            const response = await api.get(`/users/${id}`);
            const freshUser = response.data.user;

            if (freshUser) {
                // Merge token if fresh user doesn't have it (usually API doesn't return token on profile fetch)
                if (!freshUser.token && (current as any).token) {
                    (freshUser as any).token = (current as any).token;
                }
                auth.saveSession(freshUser);
                return freshUser;
            }
        } catch (err) {
            console.error('Failed to refresh session:', err);
        }
        return current;
    }
};

export const getAllUsers = async (ignoreCache = false): Promise<UserProfile[]> => {
    if (!ignoreCache) {
        const cached = getCachedData('all_users_list');
        if (cached) return cached;
    }
    const response = await api.get('/users');
    setCachedData('all_users_list', response.data.users);
    return response.data.users;
};

export const getFeaturedPlayers = async (ids: string[], ignoreCache = false): Promise<UserProfile[]> => {
    if (ids.length === 0) return [];
    if (!ignoreCache) {
        const cached = getCachedData('featured_players_list');
        if (cached) return cached;
    }
    const response = await api.get(`/users/featured?ids=${ids.join(',')}`);
    setCachedData('featured_players_list', response.data.users);
    return response.data.users;
};

export const getUserById = async (id: string): Promise<UserProfile | null> => {
    const response = await api.get(`/users/${id}`);
    return response.data.user;
};

export const updateUserRole = async (userId: string, role: string): Promise<boolean> => {
    const response = await api.post('/users/role', { userId, role });
    return response.data.success;
};

export const banUser = async (userId: string): Promise<boolean> => {
    const response = await api.post('/users/ban', { userId });
    return response.data.success;
};

export const adminUpdateUser = async (userId: string, updates: any): Promise<boolean> => {
    const response = await api.post('/users/admin-update', { userId, updates });
    return response.data.success;
};

export const deleteMatchHistoryFromAllUsers = async (tournamentId: string): Promise<boolean> => {
    try {
        const response = await api.delete(`/users/match-history/${tournamentId}`);
        return response.data.success;
    } catch (err) {
        console.error("Failed to delete match history from all users", err);
        return false;
    }
};

export const correctUserStatsAndHistory = async (userId: string, tournamentId: string, oldStats: any, newStats: any): Promise<boolean> => {
    try {
        const response = await api.post('/users/correct-stats', { userId, tournamentId, oldStats, newStats });
        return response.data.success;
    } catch (err) {
        console.error("Failed to correct user stats", err);
        return false;
    }
};
