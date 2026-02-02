import axios from 'axios';
import { Team, TeamInvite } from '../types';
import { getCachedData, setCachedData } from './cacheService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

export const getTeams = async (ignoreCache = false): Promise<Team[]> => {
    if (!ignoreCache) {
        const cached = getCachedData('teams_list');
        if (cached) return cached;
    }
    const response = await api.get('/teams');
    setCachedData('teams_list', response.data.teams);
    return response.data.teams;
};

export const createTeam = async (team: Omit<Team, 'id' | 'createdAt'>): Promise<Team> => {
    const response = await api.post('/teams/create', team);
    return response.data.team;
};

export const getTeamByUserId = async (userId: string, ignoreCache = false): Promise<Team | null> => {
    if (!ignoreCache) {
        const cached = getCachedData(`user_team_${userId}`);
        if (cached) return cached;
    }
    const response = await api.get(`/teams/user/${userId}`);
    if (response.data.team) {
        setCachedData(`user_team_${userId}`, response.data.team);
    }
    return response.data.team;
};

export const getTeamById = async (id: string, ignoreCache = false): Promise<Team | null> => {
    if (!ignoreCache) {
        const cached = getCachedData(`team_${id}`);
        if (cached) return cached;
    }
    const response = await api.get(`/teams/${id}`);
    if (response.data.team) {
        setCachedData(`team_${id}`, response.data.team);
    }
    return response.data.team;
};

export const deleteTeam = async (teamId: string): Promise<boolean> => {
    try {
        const response = await api.delete(`/teams/${teamId}`);
        return response.data.success;
    } catch (err) {
        console.error("Failed to delete team", err);
        return false;
    }
};

export const getMyInvites = async (userId: string): Promise<TeamInvite[]> => {
    const response = await api.get(`/notifications/invites/${userId}`);
    return response.data.invites;
};

export const inviteUserToTeam = async (teamId: string, receiverId: string, message?: string) => {
    const response = await api.post('/teams/invite', { teamId, receiverId, message });
    return response.data;
};

export const deleteMatchHistoryFromAllTeams = async (tournamentId: string): Promise<boolean> => {
    try {
        const response = await api.delete(`/teams/match-history/${tournamentId}`);
        return response.data.success;
    } catch (err) {
        console.error("Failed to delete team match history", err);
        return false;
    }
};

export const correctTeamStatsAndHistory = async (teamId: string, tournamentId: string, oldStats: any, newStats: any): Promise<boolean> => {
    try {
        const response = await api.post('/teams/correct-stats', { teamId, tournamentId, oldStats, newStats });
        return response.data.success;
    } catch (err) {
        console.error("Failed to correct team stats", err);
        return false;
    }
};
