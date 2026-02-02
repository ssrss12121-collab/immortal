import axios from 'axios';
import { Transaction } from '../types';

export type { Transaction };

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

export const getAllTransactions = async (): Promise<Transaction[]> => {
    try {
        const response = await api.get('/transactions');
        return response.data.transactions || [];
    } catch (err) {
        console.error("Failed to fetch transactions", err);
        return [];
    }
};

export const getTransactionsByUser = async (userId: string): Promise<Transaction[]> => {
    try {
        const response = await api.get(`/transactions/user/${userId}`);
        return response.data.transactions || [];
    } catch (err) {
        console.error("Failed to fetch user transactions", err);
        return [];
    }
};

export const getPendingDeposits = async (): Promise<Transaction[]> => {
    const txs = await getAllTransactions();
    return txs.filter(t => t.type === 'deposit' && t.status === 'pending');
};

export const getPendingWithdrawals = async (): Promise<Transaction[]> => {
    const txs = await getAllTransactions();
    return txs.filter(t => t.type === 'withdrawal' && t.status === 'pending');
};

export const createTransaction = async (transaction: Omit<Transaction, 'id' | 'createdAt'>): Promise<Transaction | null> => {
    try {
        const response = await api.post('/transactions/create', transaction);
        return response.data.transaction;
    } catch (err) {
        console.error("Failed to create transaction", err);
        return null;
    }
};

export const approveDeposit = async (id: string, processedBy: string): Promise<boolean> => {
    try {
        console.log(`Sending approval request for ${id} to /transactions/update-status`);
        const response = await api.post('/transactions/update-status', { id, status: 'completed', processedBy });
        return response.data.success;
    } catch (err) {
        console.error("Failed to approve deposit", err);
        return false;
    }
};

export const approveWithdrawal = approveDeposit;

export const rejectTransaction = async (id: string, processedBy: string, reason?: string): Promise<boolean> => {
    try {
        const response = await api.post('/transactions/update-status', { id, status: 'rejected', processedBy, notes: reason });
        return response.data.success;
    } catch (err) {
        console.error("Failed to reject transaction", err);
        return false;
    }
};

export const getTransactionStats = async () => {
    try {
        const response = await api.get('/transactions/stats');
        return response.data.stats;
    } catch (err) {
        console.error("Failed to fetch transaction stats", err);
        return {
            total: 0,
            pendingDeposits: 0,
            pendingWithdrawals: 0,
            totalDeposits: 0,
            totalWithdrawals: 0,
            approvedToday: 0
        };
    }
};

export const updateUserBalance = async (userId: string, amount: number): Promise<boolean> => {
    try {
        const response = await api.post('/users/balance', { userId, amount });
        return response.data.success;
    } catch (err) {
        console.error("Failed to update user balance", err);
        return false;
    }
};
