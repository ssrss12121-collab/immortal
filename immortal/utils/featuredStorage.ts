import axios from 'axios';
import { getCachedData, setCachedData } from './cacheService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const FEATURED_PLAYERS_KEY = 'featured_players';

export const getFeaturedPlayerIds = async (ignoreCache = false): Promise<string[]> => {
    if (!ignoreCache) {
        const cached = getCachedData('featured_player_ids');
        if (cached) return cached;
    }
    try {
        const res = await axios.get(`${API_URL}/system/settings/${FEATURED_PLAYERS_KEY}`);
        const data = res.data.value || [];
        setCachedData('featured_player_ids', data);
        return data;
    } catch (error) {
        console.error("Failed to load featured players", error);
        return [];
    }
};

const saveFeaturedPlayerIds = async (ids: string[]) => {
    try {
        await axios.post(`${API_URL}/system/settings/update`, {
            key: FEATURED_PLAYERS_KEY,
            value: ids
        });
    } catch (error) {
        console.error("Failed to save featured players", error);
    }
};

export const addFeaturedPlayer = async (playerId: string) => {
    const ids = await getFeaturedPlayerIds();
    if (!ids.includes(playerId)) {
        ids.push(playerId);
        await saveFeaturedPlayerIds(ids);
    }
    return true;
};

export const removeFeaturedPlayer = async (playerId: string) => {
    const ids = await getFeaturedPlayerIds();
    const filtered = ids.filter(id => id !== playerId);
    await saveFeaturedPlayerIds(filtered);
    return true;
};
