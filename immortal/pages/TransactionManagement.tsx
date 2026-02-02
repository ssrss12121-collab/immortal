import React, { useState, useEffect } from 'react';
import {
    Zap, TrendingUp, Clock, CheckCircle, XCircle,
    Search, Filter, Eye, Shield, History, Calendar,
    User, CreditCard, Wallet, ExternalLink, X, AlertTriangle,
    Camera, Hash, UserCircle
} from 'lucide-react';
import {
    getAllTransactions,
    getTransactionStats,
    Transaction,
    approveDeposit,
    rejectTransaction
} from '../utils/transactionStorage';

type TabType = 'overview' | 'payments' | 'audit';

const TransactionManagement: React.FC = () => {
    const [activeTab, setActiveTab] = useState<TabType>('overview');
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
    const [stats, setStats] = useState({
        totalRevenue: 0,
        activeSubs: 0,
        pendingVerifications: 0,
        todaySales: 0
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [txs, statsData] = await Promise.all([
                getAllTransactions(),
                getTransactionStats()
            ]);
            setTransactions(txs);
            setStats({
                totalRevenue: statsData.totalDeposits || 0,
                activeSubs: txs.filter(t => t.type === 'deposit' && t.status === 'completed').length,
                pendingVerifications: (statsData.pendingDeposits || 0) + (statsData.pendingWithdrawals || 0),
                todaySales: statsData.approvedToday || 0
            });
        } catch (err) {
            console.error("Failed to load transactions:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAction = async (id: string, action: 'approve' | 'reject') => {
        if (!window.confirm(`Are you sure you want to ${action} this transaction?`)) return;

        const success = action === 'approve'
            ? await approveDeposit(id, 'Admin')
            : await rejectTransaction(id, 'Admin', 'Information mismatch or invalid proof.');

        if (success) {
            setSelectedTx(null);
            loadData();
        } else {
            alert('Failed to process transaction.');
        }
    };

    const filteredTransactions = transactions.filter(t =>
        (t.userDetails?.ign?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.userDetails?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.transactionId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.id.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (activeTab === 'overview' ? true : activeTab === 'payments' ? t.status === 'completed' : t.status === 'pending')
    );

    return (
        <div className="space-y-6 pb-20">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-black italic text-white tracking-widest uppercase flex items-center gap-2">
                        <Shield className="text-gaming-accent" size={24} /> Transaction <span className="text-gaming-accent">Ops</span>
                    </h2>
                    <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mt-1">Global Audit & Revenue Management</p>
                </div>
                <button onClick={loadData} className="p-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors">
                    <History size={20} className={isLoading ? "animate-spin text-gaming-accent" : "text-gray-400"} />
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total Revenue', value: stats.totalRevenue, icon: TrendingUp, color: 'text-gaming-accent', suffix: '৳' },
                    { label: 'Active Subs', value: stats.activeSubs, icon: Zap, color: 'text-blue-500' },
                    { label: 'Pending', value: stats.pendingVerifications, icon: Clock, color: 'text-yellow-500' },
                    { label: 'Today Sales', value: stats.todaySales, icon: Calendar, color: 'text-purple-500' }
                ].map((stat, i) => (
                    <div key={i} className="bg-[#12121a] border border-white/5 p-4 rounded-xl relative overflow-hidden group">
                        <div className={`absolute -right-2 -bottom-2 opacity-10 ${stat.color} group-hover:scale-110 transition-transform`}>
                            <stat.icon size={48} />
                        </div>
                        <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest relative z-10">{stat.label}</p>
                        <p className="text-xl font-black text-white mt-1 relative z-10">
                            {stat.suffix}{stat.value.toLocaleString()}
                        </p>
                    </div>
                ))}
            </div>

            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input
                        type="text"
                        placeholder="SCAN PLAYER IGN, HASH OR IDENTITY..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-[#12121a] border border-white/10 p-4 pl-12 rounded-xl text-xs text-white focus:border-gaming-accent outline-none font-mono tracking-tighter"
                    />
                </div>
                <div className="flex bg-[#0c0c12]/80 backdrop-blur p-1 rounded-xl border border-white/10">
                    {(['overview', 'payments', 'audit'] as const).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-gaming-accent text-black shadow-lg shadow-gaming-accent/20' : 'text-gray-500 hover:text-white'}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* List */}
            <div className="bg-[#12121a]/30 border border-white/5 rounded-2xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-black/40 text-[9px] uppercase font-black tracking-widest text-gray-500">
                        <tr>
                            <th className="p-4 border-b border-white/5">Initiator</th>
                            <th className="p-4 border-b border-white/5">Category</th>
                            <th className="p-4 border-b border-white/5">Protocol</th>
                            <th className="p-4 border-b border-white/5 text-right">Value</th>
                            <th className="p-4 border-b border-white/5 text-center">Status</th>
                            <th className="p-4 border-b border-white/5"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {filteredTransactions.length > 0 ? filteredTransactions.map((tx) => (
                            <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors group">
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gaming-accent/10 border border-gaming-accent/20 flex items-center justify-center text-gaming-accent font-black text-xs uppercase">
                                            {tx.userDetails?.ign?.charAt(0) || 'U'}
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-white group-hover:text-gaming-accent transition-colors">{tx.userDetails?.ign || 'Unknown'}</p>
                                            <p className="text-[9px] text-gray-500 font-mono tracking-tighter uppercase">{tx.userDetails?.playerId || 'No ID'}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <span className={`text-[9px] font-black uppercase px-2 py-1 rounded ${tx.type === 'deposit' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                        {tx.type}
                                    </span>
                                </td>
                                <td className="p-4 px-2">
                                    <div className="flex items-center gap-1.5 text-gray-400 font-mono text-[10px]">
                                        <Wallet size={12} className="text-gaming-accent opacity-50" />
                                        <span className="uppercase">{tx.method}</span>
                                    </div>
                                </td>
                                <td className="p-4 text-right">
                                    <p className="text-sm font-black text-white italic tracking-widest">৳{tx.amount}</p>
                                    <p className="text-[8px] text-gray-600 font-bold uppercase">{new Date(tx.createdAt).toLocaleDateString()}</p>
                                </td>
                                <td className="p-4 text-center">
                                    <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[8px] font-black uppercase ${tx.status === 'completed' ? 'text-green-500 bg-green-500/10' :
                                            tx.status === 'pending' ? 'text-yellow-500 bg-yellow-500/10 animate-pulse' :
                                                'text-red-500 bg-red-500/10'
                                        }`}>
                                        <div className={`w-1 h-1 rounded-full ${tx.status === 'completed' ? 'bg-green-500' : tx.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'}`} />
                                        {tx.status}
                                    </div>
                                </td>
                                <td className="p-4 text-right">
                                    <button
                                        onClick={() => setSelectedTx(tx)}
                                        className="p-2 bg-white/5 hover:bg-gaming-accent/10 text-gray-400 hover:text-gaming-accent rounded-lg transition-all"
                                    >
                                        <Eye size={16} />
                                    </button>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={6} className="py-20 text-center">
                                    <div className="opacity-20 flex flex-col items-center gap-2">
                                        <Shield size={48} />
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em]">Zero Activity Logs</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Detail Modal */}
            {selectedTx && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
                    <div className="bg-[#0c0c12] border border-white/10 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl relative">
                        {/* Modal Header */}
                        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-gradient-to-r from-gaming-accent/5 to-transparent">
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${selectedTx.type === 'deposit' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                    {selectedTx.type === 'deposit' ? <TrendingUp size={24} /> : <TrendingUp size={24} className="rotate-180" />}
                                </div>
                                <div>
                                    <h3 className="text-lg font-black italic uppercase tracking-widest text-white">Audit: {selectedTx.type}</h3>
                                    <p className="text-[10px] text-gaming-accent font-black uppercase tracking-tighter">Transmission ID: {selectedTx.id}</p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedTx(null)} className="p-2 hover:bg-white/10 rounded-full text-gray-500 hover:text-white transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                            {/* User Section */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                    <div className="flex items-center gap-2 mb-2">
                                        <UserCircle size={14} className="text-gaming-accent" />
                                        <span className="text-[9px] font-black text-gray-500 uppercase">Operator</span>
                                    </div>
                                    <p className="text-sm font-black text-white">{selectedTx.userDetails?.name || 'Unknown'}</p>
                                    <p className="text-[10px] font-mono text-gray-500">@{selectedTx.userDetails?.ign || 'unknown'}</p>
                                </div>
                                <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Hash size={14} className="text-gaming-accent" />
                                        <span className="text-[9px] font-black text-gray-500 uppercase">Player ID</span>
                                    </div>
                                    <p className="text-sm font-black text-white font-mono">{selectedTx.userDetails?.playerId || 'N/A'}</p>
                                </div>
                            </div>

                            {/* Payment Section */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 px-2">
                                    <CreditCard size={14} className="text-gaming-accent" />
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Payment Protocol</span>
                                </div>

                                <div className="bg-black/40 rounded-2xl border border-white/5 p-4 space-y-4">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-gray-500 font-bold uppercase tracking-wider">Method</span>
                                        <span className="text-white font-black uppercase">{selectedTx.method}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-gray-500 font-bold uppercase tracking-wider">Account</span>
                                        <span className="text-white font-black font-mono">{selectedTx.accountNumber || 'NOT SPECIFIED'}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-gray-500 font-bold uppercase tracking-wider">Reference ID</span>
                                        <span className="text-gaming-accent font-black font-mono">{selectedTx.transactionId || 'PENDING SYNC'}</span>
                                    </div>
                                    <div className="pt-2 border-t border-white/5 flex justify-between items-center">
                                        <span className="text-gray-500 font-bold uppercase tracking-[0.2em] text-[10px]">Settlement Amount</span>
                                        <span className="text-2xl font-black text-white italic tracking-tighter">৳{selectedTx.amount}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Screenshot viewer */}
                            {selectedTx.screenshotUrl && (
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 px-2">
                                        <Camera size={14} className="text-gaming-accent" />
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Verification Proof</span>
                                    </div>
                                    <div className="relative group rounded-2xl overflow-hidden border border-white/10">
                                        <img src={selectedTx.screenshotUrl} alt="Payment Proof" className="w-full h-auto" />
                                        <a href={selectedTx.screenshotUrl} target="_blank" rel="noreferrer" className="absolute top-4 right-4 p-2 bg-black/60 rounded-full text-white hover:bg-gaming-accent hover:text-black transition-all opacity-0 group-hover:opacity-100">
                                            <ExternalLink size={20} />
                                        </a>
                                    </div>
                                </div>
                            )}

                            {/* Audit Notes */}
                            {selectedTx.notes && (
                                <div className="bg-red-500/5 border border-red-500/10 p-4 rounded-2xl space-y-2">
                                    <div className="flex items-center gap-2">
                                        <AlertTriangle size={14} className="text-red-500" />
                                        <span className="text-[9px] font-black text-red-500 uppercase">Operation Notes</span>
                                    </div>
                                    <p className="text-[10px] text-gray-400 font-bold">{selectedTx.notes}</p>
                                </div>
                            )}

                            {/* Trail Section */}
                            {selectedTx.processedAt && (
                                <div className="pt-4 border-t border-white/10 flex justify-between text-[8px] font-black text-gray-600 uppercase tracking-widest">
                                    <span>Processed: {new Date(selectedTx.processedAt).toLocaleString()}</span>
                                    <span>By: {selectedTx.processedBy}</span>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer (Actions) */}
                        {selectedTx.status === 'pending' && (
                            <div className="p-6 bg-white/5 border-t border-white/10 flex gap-3">
                                <button
                                    onClick={() => handleAction(selectedTx.id, 'reject')}
                                    className="flex-1 py-4 bg-red-500/10 text-red-500 font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-red-500/20 transition-all border border-red-500/20"
                                >
                                    Reject Protocol
                                </button>
                                <button
                                    onClick={() => handleAction(selectedTx.id, 'approve')}
                                    className="flex-[2] py-4 bg-gaming-accent text-black font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-white transition-all shadow-lg shadow-gaming-accent/20"
                                >
                                    Approve & Settle
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TransactionManagement;
