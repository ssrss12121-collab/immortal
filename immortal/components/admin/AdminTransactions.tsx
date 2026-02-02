import React, { useState } from 'react';
import { DollarSign, ArrowUpRight, ArrowDownLeft, Search, Filter } from 'lucide-react';

interface Transaction {
    id: string;
    userId: string;
    userName: string;
    amount: number;
    type: 'DEPOSIT' | 'WITHDRAWAL' | 'ENTRY_FEE' | 'PRIZE';
    status: 'COMPLETED' | 'PENDING' | 'FAILED';
    date: string;
    method?: string; // e.g., Bkash, Nagad
}

const AdminTransactions: React.FC = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([
        {
            id: 'TXN-1001',
            userId: '1',
            userName: 'Siam Ahmad',
            amount: 500,
            type: 'DEPOSIT',
            status: 'COMPLETED',
            date: '2025-12-03 10:30 AM',
            method: 'Bkash'
        },
        {
            id: 'TXN-1002',
            userId: '2',
            userName: 'John Doe',
            amount: 200,
            type: 'WITHDRAWAL',
            status: 'PENDING',
            date: '2025-12-03 09:15 AM',
            method: 'Nagad'
        },
        {
            id: 'TXN-1003',
            userId: '1',
            userName: 'Siam Ahmad',
            amount: 50,
            type: 'ENTRY_FEE',
            status: 'COMPLETED',
            date: '2025-12-02 08:00 PM'
        },
        {
            id: 'TXN-1004',
            userId: '3',
            userName: 'Pro Gamer',
            amount: 1000,
            type: 'PRIZE',
            status: 'COMPLETED',
            date: '2025-12-01 11:45 PM'
        }
    ]);

    const [filter, setFilter] = useState('ALL');

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'COMPLETED': return 'text-green-400 bg-green-400/10';
            case 'PENDING': return 'text-gaming-accent bg-gaming-accent/10';
            case 'FAILED': return 'text-red-400 bg-red-400/10';
            default: return 'text-gray-400 bg-gray-400/10';
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'DEPOSIT': return <ArrowDownLeft size={16} className="text-green-400" />;
            case 'WITHDRAWAL': return <ArrowUpRight size={16} className="text-red-400" />;
            default: return <DollarSign size={16} className="text-blue-400" />;
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Transactions</h2>
                <div className="flex gap-2">
                    <button className="p-2 bg-white/5 border border-white/10 rounded-lg text-gray-400 hover:text-white transition-colors">
                        <Filter size={20} />
                    </button>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search ID or User..."
                            className="bg-white/5 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-white focus:outline-none focus:border-gaming-accent w-64"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-lg overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-black/40 text-gray-400 text-sm uppercase">
                        <tr>
                            <th className="p-4">Transaction ID</th>
                            <th className="p-4">User</th>
                            <th className="p-4">Type</th>
                            <th className="p-4">Amount</th>
                            <th className="p-4">Date</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {transactions.map((txn) => (
                            <tr key={txn.id} className="hover:bg-white/5 transition-colors">
                                <td className="p-4 font-mono text-sm text-gray-300">{txn.id}</td>
                                <td className="p-4">
                                    <div className="font-medium text-white">{txn.userName}</div>
                                    <div className="text-xs text-gray-500">ID: {txn.userId}</div>
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 rounded-full bg-white/5">
                                            {getTypeIcon(txn.type)}
                                        </div>
                                        <span className="text-sm text-gray-300">{txn.type.replace('_', ' ')}</span>
                                    </div>
                                </td>
                                <td className="p-4 font-bold text-white">
                                    {txn.type === 'WITHDRAWAL' || txn.type === 'ENTRY_FEE' ? '-' : '+'}
                                    ৳{txn.amount}
                                </td>
                                <td className="p-4 text-sm text-gray-400">{txn.date}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(txn.status)}`}>
                                        {txn.status}
                                    </span>
                                </td>
                                <td className="p-4 text-right">
                                    {txn.status === 'PENDING' && (
                                        <div className="flex justify-end gap-2">
                                            <button className="px-3 py-1 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30 text-xs font-bold transition-colors">
                                                Approve
                                            </button>
                                            <button className="px-3 py-1 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 text-xs font-bold transition-colors">
                                                Reject
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminTransactions;
