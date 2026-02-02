

export interface PaymentMethod {
    id: string;
    name: string;
    number: string;
    accountName?: string;
    type: 'personal' | 'agent' | 'merchant';
    instruction?: string;
    logo: string; // Base64 or URL
    minAmount: number;
    maxAmount: number;
    enabled?: boolean;
    usage: 'deposit' | 'withdrawal' | 'both';
    color: string;
}

export interface PaymentSettings {
    methods: PaymentMethod[];
    supportContact: string;
    depositWarning: string;
    manualDepositEnabled: boolean;
    autoGatewayEnabled: boolean;
    gatewayBaseUrl: string;
    gatewayApiKey: string;
    mockMode: boolean;
}

const defaultSettings: PaymentSettings = {
    manualDepositEnabled: true,
    autoGatewayEnabled: false,
    mockMode: false,
    gatewayBaseUrl: 'https://pay-siam.com.immortalzone.xyz/api',
    gatewayApiKey: '78998222869320b96394c893428973430938908169320b96394c91966940666',
    methods: [
        {
            id: 'bkash',
            name: 'Bkash',
            number: '01700000000',
            accountName: 'Immora Admin',
            type: 'personal',
            instruction: 'Send Money to this number',
            logo: 'https://freepnglogo.com/images/all_img/1701593888bkash-logo-transparent.png',
            minAmount: 50,
            maxAmount: 25000,
            enabled: true,
            usage: 'both',
            color: '#e2136e'
        },
        {
            id: 'nagad',
            name: 'Nagad',
            number: '01700000000',
            accountName: 'Immora Admin',
            type: 'personal',
            instruction: 'Send Money to this number',
            logo: 'https://freepnglogo.com/images/all_img/1701593859nagad-logo-transparent.png',
            minAmount: 50,
            maxAmount: 25000,
            enabled: true,
            usage: 'both',
            color: '#c9331e'
        }
    ],
    supportContact: '+8801700000000',
    depositWarning: 'Do not use Cash In. Only Send Money is accepted.'
};

import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const PAYMENT_SETTINGS_KEY = 'payment_settings';

export const getPaymentSettings = async (): Promise<PaymentSettings> => {
    try {
        const res = await axios.get(`${API_URL}/system/settings/${PAYMENT_SETTINGS_KEY}`);
        return res.data.value || defaultSettings;
    } catch (error) {
        console.error("Failed to load payment settings", error);
        return defaultSettings;
    }
};

export const savePaymentSettings = async (settings: PaymentSettings) => {
    try {
        await axios.post(`${API_URL}/system/settings/update`, {
            key: PAYMENT_SETTINGS_KEY,
            value: settings
        });
        window.dispatchEvent(new Event('payment-settings-updated'));
    } catch (error) {
        console.error("Failed to save payment settings", error);
    }
};

export const addPaymentMethod = async (method: PaymentMethod) => {
    const settings = await getPaymentSettings();
    settings.methods.push(method);
    await savePaymentSettings(settings);
};

export const updatePaymentMethod = async (id: string, updates: Partial<PaymentMethod>) => {
    const settings = await getPaymentSettings();
    settings.methods = settings.methods.map(m => m.id === id ? { ...m, ...updates } : m);
    await savePaymentSettings(settings);
};

export const deletePaymentMethod = async (id: string) => {
    const settings = await getPaymentSettings();
    settings.methods = settings.methods.filter(m => m.id !== id);
    await savePaymentSettings(settings);
};

export const updateSupportContact = async (contact: string) => {
    const settings = await getPaymentSettings();
    settings.supportContact = contact;
    await savePaymentSettings(settings);
};
