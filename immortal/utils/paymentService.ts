import { PAYMENT_CONFIG } from './paymentConfig';
import { createTransaction } from './transactionStorage';
import { getPaymentSettings } from './paymentSettings';

/**
 * Payment Response Interface
 */
export interface PaymentResponse {
    success: boolean;
    message: string;
    payment_url?: string;
    transaction_id?: string;
    data?: any;
}

/**
 * Payment Request Interface
 */
export interface PaymentRequest {
    amount: number;
    userId: string;
    method?: string;
}

/**
 * Error Handler
 */
const handlePaymentError = (error: any): PaymentResponse => {
    console.error('💥 Payment Error:', error);

    let message = 'Payment failed. Please try again.';

    // Network errors
    if (error.name === 'TypeError' || error.message?.includes('fetch')) {
        message = 'Network error. Unable to reach payment server. Please check your connection.';
    }
    // CORS errors
    else if (error.message?.includes('CORS')) {
        message = 'Payment server not accessible. Please contact support.';
    }
    // Timeout errors
    else if (error.name === 'AbortError') {
        message = 'Request timeout. Please try again.';
    }
    // Server errors
    else if (error.status >= 500) {
        message = 'Payment server error. Please try again later.';
    }
    // Client errors
    else if (error.status >= 400) {
        message = error.message || 'Invalid payment request.';
    }

    return {
        success: false,
        message
    };
};

/**
 * Mock Payment Handler (for testing)
 */
const mockPayment = async (amount: number, userId: string): Promise<PaymentResponse> => {
    console.warn('⚠️ MOCK MODE ACTIVE - No real payment will be processed');
    console.log('📦 Mock Payment:', { amount, userId });

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Create completed transaction
    const txn = await createTransaction({
        userId,
        type: 'deposit',
        amount,
        status: 'completed',
        method: 'gateway',
        transactionId: `MOCK-TXN-${Date.now()}`,
        processedBy: 'system'
    });

    // Update user balance (Handled by backend admin approval in this new flow)
    // updateUserBalance(userId, amount); // Deprecated

    // Simulate successful response
    return {
        success: true,
        message: 'Payment initiated successfully (MOCK - Pending Approval)',
        payment_url: undefined, // No URL needed for instant mock success
        transaction_id: txn ? txn.id : `MOCK-TXN-${Date.now()}`
    };
};

/**
 * Initiate Deposit Payment
 * 
 * @param amount - Amount to deposit (minimum 10 BDT)
 * @param userId - User ID
 * @returns Payment response with payment URL or error
 */
export const initiateDeposit = async (
    amount: number,
    userId: string
): Promise<PaymentResponse> => {
    try {
        // Validate amount
        if (amount < PAYMENT_CONFIG.SETTINGS.MIN_AMOUNT) {
            return {
                success: false,
                message: `Minimum deposit amount is ${PAYMENT_CONFIG.SETTINGS.MIN_AMOUNT} BDT`
            };
        }

        if (amount > PAYMENT_CONFIG.SETTINGS.MAX_AMOUNT) {
            return {
                success: false,
                message: `Maximum deposit amount is ${PAYMENT_CONFIG.SETTINGS.MAX_AMOUNT} BDT`
            };
        }

        // Real payment processing - FETCH DYNAMIC CONFIG
        const settings = await getPaymentSettings();

        // Check dynamic mock mode
        if (settings.mockMode) {
            return await mockPayment(amount, userId);
        }

        const baseUrl = settings.gatewayBaseUrl || PAYMENT_CONFIG.BASE_URL;
        const apiKey = settings.gatewayApiKey || PAYMENT_CONFIG.API_KEY;

        const endpoint = `${baseUrl}${PAYMENT_CONFIG.ENDPOINTS.CREATE_CHARGE}`;
        const callbackUrl = PAYMENT_CONFIG.getCallbackUrl();

        console.log('🚀 Initiating payment (Dynamic):', {
            endpoint,
            amount,
            userId,
            callbackUrl
        });

        // Create abort controller for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(
            () => controller.abort(),
            PAYMENT_CONFIG.SETTINGS.TIMEOUT
        );

        // Make API request
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                amount,
                user_id: userId,
                callback_url: callbackUrl,
                currency: PAYMENT_CONFIG.SETTINGS.CURRENCY
            }),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        console.log('📡 Response status:', response.status);

        // Handle non-OK responses
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Server error:', errorText);

            throw {
                status: response.status,
                message: errorText || `Server error: ${response.status}`
            };
        }

        // Parse response
        const data = await response.json();
        console.log('✅ Payment response:', data);

        // Return formatted response
        return {
            success: data.status || data.success || false,
            message: data.message || 'Payment initiated successfully',
            payment_url: data.payment_url || data.paymentUrl || data.url,
            transaction_id: data.transaction_id || data.transactionId || data.id,
            data
        };

    } catch (error: any) {
        return handlePaymentError(error);
    }
};

/**
 * Verify Payment Status
 * 
 * @param transactionId - Transaction ID to verify
 * @returns Payment verification response
 */
export const verifyPayment = async (
    transactionId: string
): Promise<PaymentResponse> => {
    try {
        const settings = await getPaymentSettings();
        const baseUrl = settings.gatewayBaseUrl || PAYMENT_CONFIG.BASE_URL;
        const apiKey = settings.gatewayApiKey || PAYMENT_CONFIG.API_KEY;

        const endpoint = `${baseUrl}${PAYMENT_CONFIG.ENDPOINTS.VERIFY_PAYMENT}`;

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey
            },
            body: JSON.stringify({ transaction_id: transactionId })
        });

        if (!response.ok) {
            throw new Error(`Verification failed: ${response.status}`);
        }

        const data = await response.json();

        return {
            success: data.status || false,
            message: data.message || 'Verification complete',
            data
        };

    } catch (error: any) {
        return handlePaymentError(error);
    }
};
