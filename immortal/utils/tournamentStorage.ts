import axios from 'axios';
import { Tournament, UserProfile } from '../types';
import { auth } from './auth';
import { getCachedData, setCachedData } from './cacheService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

export const getTournaments = async (ignoreCache = false): Promise<Tournament[]> => {
    if (!ignoreCache) {
        const cached = getCachedData('tournaments_list');
        if (cached) return cached;
    }
    const response = await api.get('/tournaments');
    setCachedData('tournaments_list', response.data.tournaments);
    return response.data.tournaments;
};

export const saveTournament = async (tournament: Tournament) => {
    const response = await api.post('/tournaments/save', tournament);
    return response.data;
};

export const deleteTournament = async (id: string, deepDelete: boolean = false) => {
    const response = await api.delete(`/tournaments/${id}`, { data: { deepDelete } });
    return response.data;
};

export const joinTournament = async (tournamentId: string, userProfile: UserProfile, teamMembers?: UserProfile[]): Promise<{ success: boolean; message: string }> => {
    const response = await api.post('/tournaments/join', {
        tournamentId,
        userId: userProfile.id,
        teamMembers: teamMembers?.map(m => ({ id: m.id, name: m.ign }))
    });

    const { success, message, user } = response.data;

    if (success && user) {
        // Update local session
        const current = auth.getCurrentUser();
        if (current) {
            auth.saveSession({ ...current, ...user });
        }
    }

    return { success, message };
};

export const restartTournament = async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.post(`/tournaments/restart/${id}`);
    return response.data;
};

export const rematchTournament = async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.post(`/tournaments/rematch/${id}`);
    return response.data;
};

export const publishTournamentResults = async (tournamentId: string, results: any) => {
    const response = await api.post('/tournaments/publish', { tournamentId, results });
    return response.data;
};
