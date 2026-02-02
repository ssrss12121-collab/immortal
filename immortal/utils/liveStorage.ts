import axios from 'axios';
import { LiveConfig } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const LIVE_CONFIG_KEY = 'live_config';

export const getLiveConfig = async (): Promise<LiveConfig> => {
    try {
        const res = await axios.get(`${API_URL}/system/settings/${LIVE_CONFIG_KEY}`);
        return res.data.value || { streams: [], archive: [] };
    } catch (error) {
        console.error("Failed to load live config", error);
        return { streams: [], archive: [] };
    }
};

export const saveLiveConfig = async (config: LiveConfig) => {
    try {
        await axios.post(`${API_URL}/system/settings/update`, {
            key: LIVE_CONFIG_KEY,
            value: config
        });
    } catch (error) {
        console.error("Failed to save live config", error);
    }
};
