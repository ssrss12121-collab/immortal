import React, { useState, useEffect } from 'react';
import {
    Zap, TrendingUp, Clock, CheckCircle, XCircle,
    Search, Filter, Eye, Shield, History, Calendar,
    User, CreditCard, Wallet, ExternalLink, X, AlertTriangle,
    Camera, Hash, UserCircle, UserCheck, Crown
} from 'lucide-react';
import {
    getAllTransactions,
    getTransactionStats,
    Transaction,
    approveDeposit,
    rejectTransaction
} from '../../utils/transactionStorage';

type TabType = 'overview' | 'payments' | 'audit';

const AdminSubscriptions: React.FC = () => {
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
            console.error("Failed to load subscription data:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAction = async (id: string, action: 'approve' | 'reject') => {
        if (!window.confirm(`Are you sure you want to ${action} this enrollment?`)) return;

        const success = action === 'approve'
            ? await approveDeposit(id, 'Admin')
            : await rejectTransaction(id, 'Admin', 'Information mismatch or invalid proof or expired transaction.');

        if (success) {
            setSelectedTx(null);
            loadData();
        } else {
            alert('Protocol error while processing status.');
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
                        <Crown className="text-gaming-accent" size={24} /> Subscription <span className="text-gaming-accent">Management</span>
                    </h2>
                    <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mt-1">Global Membership Audit & Revenue Ops</p>
                </div>
                <button onClick={loadData} className="p-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors">
                    <History size={20} className={isLoading ? "animate-spin text-gaming-accent" : "text-gray-400"} />
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Cumulative Revenue', value: stats.totalRevenue, icon: TrendingUp, color: 'text-gaming-accent', suffix: '৳' },
                    { label: 'Active Memberships', value: stats.activeSubs, icon: UserCheck, color: 'text-blue-500' },
                    { label: 'Pending Audits', value: stats.pendingVerifications, icon: Clock, color: 'text-yellow-500' },
                    { label: 'Sales Today', value: stats.todaySales, icon: Calendar, color: 'text-purple-500' }
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
                        placeholder="SCAN OPERATOR IGN, PAYMENT HASH OR ID..."
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

            {/* Subscription Table */}
            <div className="bg-[#12121a]/30 border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-black/40 text-[9px] uppercase font-black tracking-widest text-gray-500">
                        <tr>
                            <th className="p-4 border-b border-white/5 font-black uppercase">Member Info</th>
                            <th className="p-4 border-b border-white/5 font-black uppercase">Plan Type</th>
                            <th className="p-4 border-b border-white/5 font-black uppercase">Payment Source</th>
                            <th className="p-4 border-b border-white/5 text-right font-black uppercase">Premium Value</th>
                            <th className="p-4 border-b border-white/5 text-center font-black uppercase">Vault Status</th>
                            <th className="p-4 border-b border-white/5"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {filteredTransactions.length > 0 ? filteredTransactions.map((tx) => (
                            <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors group">
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gaming-accent/10 border border-gaming-accent/20 flex items-center justify-center text-gaming-accent font-black text-xs uppercase shadow-inner">
                                            {tx.userDetails?.ign?.charAt(0) || 'U'}
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-white group-hover:text-gaming-accent transition-colors">{tx.userDetails?.ign || 'Unknown'}</p>
                                            <p className="text-[9px] text-gray-500 font-mono tracking-tighter uppercase">{tx.userDetails?.playerId || 'No ID'}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-md shadow-sm border border-transparent ${tx.type === 'deposit' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                                        {tx.type === 'deposit' ? 'Membership' : 'Payout'}
                                    </span>
                                </td>
                                <td className="p-4 px-2">
                                    <div className="flex items-center gap-1.5 text-gray-400 font-mono text-[10px]">
                                        <Wallet size={12} className="text-gaming-accent opacity-50" />
                                        <span className="uppercase font-bold tracking-widest">{tx.method}</span>
                                    </div>
                                </td>
                                <td className="p-4 text-right">
                                    <p className="text-sm font-black text-white italic tracking-widest">৳{tx.amount}</p>
                                    <p className="text-[8px] text-gray-600 font-bold uppercase tracking-widest">{new Date(tx.createdAt).toLocaleDateString()}</p>
                                </td>
                                <td className="p-4 text-center">
                                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[8px] font-black uppercase shadow-sm border ${tx.status === 'completed' ? 'text-green-500 bg-green-500/10 border-green-500/20' :
                                        tx.status === 'pending' ? 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20 animate-pulse' :
                                            'text-red-500 bg-red-500/10 border-red-500/20'
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
                                    <div className="opacity-20 flex flex-col items-center gap-3">
                                        <Shield size={48} className="text-gray-400" />
                                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Zero Maintenance Logs Detected</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Audit & Detailed View Modal */}
            {selectedTx && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in zoom-in-95">
                    <div className="bg-[#0c0c12] border border-white/10 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl relative shadow-gaming-accent/5">
                        {/* Modal Header */}
                        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-gradient-to-r from-gaming-accent/10 to-transparent">
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${selectedTx.type === 'deposit' ? 'bg-green-500/10 text-green-500 shadow-green-500/20' : 'bg-red-500/10 text-red-500 shadow-red-500/20'}`}>
                                    {selectedTx.type === 'deposit' ? <Crown size={24} /> : <TrendingUp size={24} className="rotate-180" />}
                                </div>
                                <div>
                                    <h3 className="text-lg font-black italic uppercase tracking-widest text-white">Manual Audit: {selectedTx.type === 'deposit' ? 'Membership' : 'Payout'}</h3>
                                    <p className="text-[10px] text-gaming-accent font-black uppercase tracking-tighter">System Reference: {selectedTx.id}</p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedTx(null)} className="p-2 hover:bg-white/10 rounded-full text-gray-500 hover:text-white transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                            {/* Member Details */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white/5 p-4 rounded-2xl border border-white/10 border-dashed">
                                    <div className="flex items-center gap-2 mb-2">
                                        <UserCircle size={14} className="text-gaming-accent" />
                                        <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Subscriber</span>
                                    </div>
                                    <p className="text-sm font-black text-white">{selectedTx.userDetails?.name || 'Unknown User'}</p>
                                    <p className="text-[10px] font-mono text-gray-500 truncate">@{selectedTx.userDetails?.ign || 'anon'}</p>
                                </div>
                                <div className="bg-white/5 p-4 rounded-2xl border border-white/10 border-dashed">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Hash size={14} className="text-gaming-accent" />
                                        <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Protocol Tag</span>
                                    </div>
                                    <p className="text-sm font-black text-white font-mono">{selectedTx.userDetails?.playerId || 'GUEST'}</p>
                                </div>
                            </div>

                            {/* Settlement Details */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 px-2">
                                    <CreditCard size={14} className="text-gaming-accent" />
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Settlement Particulars</span>
                                </div>

                                <div className="bg-black/40 rounded-2xl border border-white/5 p-5 space-y-4 shadow-inner">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-gray-500 font-black uppercase tracking-widest">Payment Gateway</span>
                                        <span className="text-white font-black uppercase bg-white/5 px-2 py-1 rounded">{selectedTx.method}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-gray-500 font-black uppercase tracking-widest">Sender Account</span>
                                        <span className="text-white font-black font-mono tracking-wider">{selectedTx.accountNumber || 'NOT DISCLOSED'}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-gray-500 font-black uppercase tracking-widest">Transaction Hash</span>
                                        <span className="text-gaming-accent font-black font-mono tracking-tighter truncate max-w-[150px]">{selectedTx.transactionId || 'AWAITING SYNC'}</span>
                                    </div>
                                    <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                                        <span className="text-gray-500 font-black uppercase tracking-[0.3em] text-[10px]">Net Value</span>
                                        <span className="text-3xl font-black text-white italic tracking-tighter">৳{selectedTx.amount}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Visual Confirmation */}
                            {selectedTx.screenshotUrl && (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 px-2">
                                        <Camera size={14} className="text-gaming-accent" />
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Transmission Evidence</span>
                                    </div>
                                    <div className="relative group rounded-2xl overflow-hidden border border-white/10 shadow-lg cursor-zoom-in">
                                        <img src={selectedTx.screenshotUrl} alt="Payment Evidence" className="w-full h-auto" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                            <Eye size={32} className="text-white" />
                                        </div>
                                        <a href={selectedTx.screenshotUrl} target="_blank" rel="noreferrer" className="absolute top-4 right-4 p-2 bg-black/60 rounded-full text-white hover:bg-gaming-accent hover:text-black transition-all shadow-lg">
                                            <ExternalLink size={20} />
                                        </a>
                                    </div>
                                </div>
                            )}

                            {/* Audit Notes & Errors */}
                            {selectedTx.notes && (
                                <div className="bg-red-500/5 border border-red-500/10 p-4 rounded-2xl space-y-2">
                                    <div className="flex items-center gap-2">
                                        <AlertTriangle size={14} className="text-red-500" />
                                        <span className="text-[9px] font-black text-red-500 uppercase tracking-widest">Operation Discrepancy</span>
                                    </div>
                                    <p className="text-[10px] text-gray-400 font-bold leading-relaxed tracking-tight">{selectedTx.notes}</p>
                                </div>
                            )}

                            {/* System Trail */}
                            {selectedTx.processedAt && (
                                <div className="pt-4 border-t border-white/10 flex justify-between text-[7px] font-black text-gray-600 uppercase tracking-[0.2em]">
                                    <span>Audit Timestamp: {new Date(selectedTx.processedAt).toLocaleString()}</span>
                                    <span>Officer: {selectedTx.processedBy}</span>
                                </div>
                            )}
                        </div>

                        {/* Audit Conclusion (Actions) */}
                        {selectedTx.status === 'pending' && (
                            <div className="p-6 bg-white/5 border-t border-white/10 flex gap-4">
                                <button
                                    onClick={() => handleAction(selectedTx.id, 'reject')}
                                    className="flex-1 py-4 bg-red-500/10 text-red-500 font-black uppercase text-[10px] tracking-widest rounded-2xl hover:bg-red-500/20 transition-all border border-red-500/20"
                                >
                                    Deny Access
                                </button>
                                <button
                                    onClick={() => handleAction(selectedTx.id, 'approve')}
                                    className="flex-[2] py-4 bg-gaming-accent text-black font-black uppercase text-[10px] tracking-widest rounded-2xl hover:bg-white transition-all shadow-xl shadow-gaming-accent/20"
                                >
                                    Authorize Membership
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminSubscriptions;
