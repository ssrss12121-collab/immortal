/**
 * Payment Gateway Configuration
 * 
 * এই ফাইলে payment gateway এর সকল configuration থাকবে।
 * API keys এবং endpoints এখানে manage করা হয়।
 */

export const PAYMENT_CONFIG = {
    // API Configuration
    API_KEY: '78998222869320b96394c893428973430938908169320b96394c91966940666',
    BASE_URL: 'https://pay-siam.com.immortalzone.xyz/api',

    // Endpoints
    ENDPOINTS: {
        CREATE_CHARGE: '/create-charge',
        VERIFY_PAYMENT: '/verify-payment',
        CHECK_STATUS: '/check-status'
    },

    // Payment Settings
    SETTINGS: {
        MIN_AMOUNT: 10,          // Minimum deposit amount (BDT)
        MAX_AMOUNT: 50000,       // Maximum deposit amount (BDT)
        CURRENCY: 'BDT',         // Currency
        TIMEOUT: 30000,          // Request timeout (30 seconds)
    },

    // Mock Mode - Set to true for testing without real payments
    MOCK_MODE: true,

    // Callback URLs will be set dynamically based on current origin
    getCallbackUrl: () => {
        if (typeof window !== 'undefined') {
            return `${window.location.origin}/profile`;
        }
        return '/profile';
    }
};

export type PaymentMethod = 'BKASH' | 'NAGAD' | 'ROCKET' | 'CARD';
