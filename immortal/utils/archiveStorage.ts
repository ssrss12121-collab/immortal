import axios from 'axios';
import { getCachedData, setCachedData } from './cacheService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

export interface MatchArchiveEntry {
    id: string;
    tournamentId: string;
    tournamentTitle: string;
    action: 'COMPLETED' | 'RESTARTED' | 'REMATCH' | 'DELAYED' | 'DELETED' | 'STARTED';
    timestamp: string;
    details: string;
    results?: {
        scores: {
            participantId: string;
            kills: number;
            position: number;
            totalPoints: number;
            memberStats?: {
                id: string;
                name: string;
                kills: number;
            }[];
        }[];
        mvpId?: string;
        publishBanner?: boolean;
    };
}

export const getArchives = async (ignoreCache = false): Promise<MatchArchiveEntry[]> => {
    if (!ignoreCache) {
        const cached = getCachedData('match_archives');
        if (cached) return cached;
    }
    const response = await api.get('/archives');
    setCachedData('match_archives', response.data.archives);
    return response.data.archives;
};

export const saveArchiveEntry = async (entry: Partial<MatchArchiveEntry>) => {
    const response = await api.post('/archives/add', entry);
    return response.data.entry;
};

export const updateArchiveEntry = async (entry: MatchArchiveEntry) => {
    const response = await api.post(`/archives/update/${entry.id}`, entry);
    return response.data.success;
};

export const deleteArchiveEntry = async (id: string) => {
    const response = await api.delete(`/archives/${id}`);
    return response.data.success;
};
