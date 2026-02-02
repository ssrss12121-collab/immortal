import React, { useState, useEffect } from 'react';
import { RefreshCw, Search, Shield, Ban, History, X, Edit2, Save, Zap, Calendar } from 'lucide-react';
import { UserProfile } from '../../types';
import { getAllUsers, updateUserRole, banUser, adminUpdateUser } from '../../utils/auth';
import MatchHistory from '../MatchHistory';

interface UserEditModalProps {
    user: UserProfile;
    onClose: () => void;
    onSave: () => void;
}

const UserEditModal: React.FC<UserEditModalProps> = ({ user, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        ign: user.ign,
        email: user.email,
        name: user.name || '',
        membership: {
            planId: user.membership?.planId || '',
            expiresAt: user.membership?.expiresAt || '',
            type: user.membership?.type || 'individual',
            challengesUsed: user.membership?.challengesUsed || 0,
            lastChallengeReset: user.membership?.lastChallengeReset || ''
        },
        gameRole: user.role || 'Rusher',
        experience: user.experience || 'Beginner',
        country: user.country || 'Bangladesh',
        district: user.district || '',
        stats: {
            kills: user.stats?.kills || 0,
            wins: user.stats?.wins || 0,
            matches: user.stats?.matches || 0,
            rankPoints: user.stats?.rankPoints || 0
        }
    });
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        try {
            const success = await adminUpdateUser(user.id, {
                ign: formData.ign,
                email: formData.email,
                name: formData.name,
                membership: formData.membership,
                gameRole: formData.gameRole,
                experience: formData.experience,
                country: formData.country,
                district: formData.district,
                stats: formData.stats
            });
            if (success) {
                alert('User updated successfully');
                onSave();
                onClose();
            }
        } catch (error) {
            alert('Failed to update user');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
            <div className="bg-[#0c0c12] border border-white/10 w-full max-w-2xl rounded-xl overflow-hidden shadow-2xl my-8">
                <div className="p-4 border-b border-white/10 flex justify-between items-center bg-gradient-to-r from-gaming-accent/10 to-transparent">
                    <h3 className="text-white font-black uppercase tracking-widest text-sm flex items-center gap-2">
                        <Edit2 size={16} className="text-gaming-accent" /> Edit Operative: {user.ign}
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[70vh] overflow-y-auto scrollbar-hide">
                    {/* Basic Info */}
                    <div className="space-y-4">
                        <h4 className="text-[10px] text-gaming-accent font-black uppercase tracking-wider border-b border-white/5 pb-1">Basic Identity</h4>
                        <div>
                            <label className="block text-[10px] text-gray-500 uppercase font-bold mb-1 ml-1">In-Game Name (IGN)</label>
                            <input value={formData.ign} onChange={e => setFormData({ ...formData, ign: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-gaming-accent" />
                        </div>
                        <div>
                            <label className="block text-[10px] text-gray-500 uppercase font-bold mb-1 ml-1">Email Address</label>
                            <input value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-gaming-accent" />
                        </div>
                        <div>
                            <label className="block text-[10px] text-gray-500 uppercase font-bold mb-1 ml-1">Membership Plan ID</label>
                            <input value={formData.membership.planId} onChange={e => setFormData({ ...formData, membership: { ...formData.membership, planId: e.target.value } })} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm text-gaming-accent font-bold focus:outline-none focus:border-gaming-accent" />
                        </div>
                        <div>
                            <label className="block text-[10px] text-gray-500 uppercase font-bold mb-1 ml-1">Expiry Date (YYYY-MM-DD)</label>
                            <input value={formData.membership.expiresAt} onChange={e => setFormData({ ...formData, membership: { ...formData.membership, expiresAt: e.target.value } })} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-gaming-accent" />
                        </div>
                        <div>
                            <label className="block text-[10px] text-gray-500 uppercase font-bold mb-1 ml-1">Duels Used</label>
                            <input type="number" value={formData.membership.challengesUsed} onChange={e => setFormData({ ...formData, membership: { ...formData.membership, challengesUsed: Number(e.target.value) } })} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-gaming-accent" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] text-gray-500 uppercase font-bold mb-1 ml-1">Country</label>
                                <input value={formData.country} onChange={e => setFormData({ ...formData, country: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-gaming-accent" />
                            </div>
                            <div>
                                <label className="block text-[10px] text-gray-500 uppercase font-bold mb-1 ml-1">District</label>
                                <input value={formData.district} onChange={e => setFormData({ ...formData, district: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-gaming-accent" />
                            </div>
                        </div>
                    </div>

                    {/* Combat Stats */}
                    <div className="space-y-4">
                        <h4 className="text-[10px] text-gaming-accent font-black uppercase tracking-wider border-b border-white/5 pb-1">Combat Performance</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] text-gray-500 uppercase font-bold mb-1 ml-1">Total Kills</label>
                                <input type="number" value={formData.stats.kills} onChange={e => setFormData({ ...formData, stats: { ...formData.stats, kills: Number(e.target.value) } })} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-gaming-accent" />
                            </div>
                            <div>
                                <label className="block text-[10px] text-gray-500 uppercase font-bold mb-1 ml-1">Total Wins</label>
                                <input type="number" value={formData.stats.wins} onChange={e => setFormData({ ...formData, stats: { ...formData.stats, wins: Number(e.target.value) } })} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-gaming-accent" />
                            </div>
                            <div>
                                <label className="block text-[10px] text-gray-500 uppercase font-bold mb-1 ml-1">Matches</label>
                                <input type="number" value={formData.stats.matches} onChange={e => setFormData({ ...formData, stats: { ...formData.stats, matches: Number(e.target.value) } })} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-gaming-accent" />
                            </div>
                            <div>
                                <label className="block text-[10px] text-gray-500 uppercase font-bold mb-1 ml-1">Rank Points</label>
                                <input type="number" value={formData.stats.rankPoints} onChange={e => setFormData({ ...formData, stats: { ...formData.stats, rankPoints: Number(e.target.value) } })} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-gaming-accent" />
                            </div>
                        </div>
                    </div>

                    <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-[10px] text-gray-500 uppercase font-bold mb-1 ml-1">Combat Role</label>
                            <select value={formData.gameRole} onChange={e => setFormData({ ...formData, gameRole: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-gaming-accent">
                                <option value="Rusher">Rusher</option>
                                <option value="Sniper">Sniper</option>
                                <option value="Supporter">Supporter</option>
                                <option value="Nader">Nader</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] text-gray-500 uppercase font-bold mb-1 ml-1">Experience Level</label>
                            <select value={formData.experience} onChange={e => setFormData({ ...formData, experience: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-gaming-accent">
                                <option value="Beginner">Beginner</option>
                                <option value="Intermediate">Intermediate</option>
                                <option value="Professional">Professional</option>
                                <option value="Elite">Elite</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-white/5 border-t border-white/10 flex justify-end gap-3">
                    <button onClick={onClose} className="px-6 py-2 bg-white/5 hover:bg-white/10 text-white rounded font-bold uppercase text-xs transition-colors">Cancel</button>
                    <button onClick={handleSave} disabled={saving} className="px-8 py-2 bg-gaming-accent text-black rounded font-black uppercase text-xs flex items-center gap-2 hover:bg-white transition-all disabled:opacity-50">
                        <Save size={14} /> {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const AdminUsers: React.FC = () => {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [viewingHistory, setViewingHistory] = useState<UserProfile | null>(null);
    const [editingUser, setEditingUser] = useState<UserProfile | null>(null);

    const loadUsers = async () => {
        setLoading(true);
        try {
            const allUsers = await getAllUsers();
            setUsers(allUsers);
        } catch (error) {
            console.error('Failed to load users', error);
            alert('Failed to load users.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    const handleDeleteUser = async (userId: string) => {
        if (window.confirm('Are you sure you want to ban this user?')) {
            try {
                await banUser(userId);
                alert('User banned successfully');
                loadUsers();
            } catch (error) {
                alert('Failed to ban user');
            }
        }
    };

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.ign.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-fade-in text-white">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-xl md:text-2xl font-bold text-white">User Management</h2>
                <div className="flex items-center space-x-3 w-full sm:w-auto">
                    <button onClick={loadUsers} className="p-2.5 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors">
                        <RefreshCw size={18} className={loading && users.length > 0 ? "animate-spin" : ""} />
                    </button>
                    <div className="relative flex-1 sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-white focus:outline-none focus:border-gaming-accent w-full text-sm"
                        />
                    </div>
                </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block bg-white/5 border border-white/10 rounded-lg overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-black/40 text-gray-400 text-[10px] uppercase tracking-widest font-bold">
                        <tr>
                            <th className="p-4">User Details</th>
                            <th className="p-4">Combat Role</th>
                            <th className="p-4">Membership</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-right">Control</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {loading && users.length === 0 ? (
                            <tr><td colSpan={5} className="p-12 text-center text-gray-500 italic">Initiating user database scan...</td></tr>
                        ) : (
                            filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-gaming-accent/[0.02] transition-colors group">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gaming-accent/10 border border-gaming-accent/20 flex items-center justify-center text-gaming-accent font-black">
                                                {user.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-white font-bold group-hover:text-gaming-accent transition-colors">{user.name}</p>
                                                <div className="flex flex-col">
                                                    <p className="text-gray-500 text-[10px] font-mono">@{user.ign}</p>
                                                    <p className="text-[9px] text-gray-600 font-bold uppercase tracking-tighter">{user.country || 'Bangladesh'} • {user.district || 'Global'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-gray-300 font-medium">
                                        <div className="flex flex-col">
                                            <span>{user.role}</span>
                                            <span className="text-[10px] text-gray-500 uppercase">{user.experience}</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <Zap size={14} className={user.membership?.expiresAt && new Date(user.membership.expiresAt) > new Date() ? 'text-gaming-accent' : 'text-gray-600'} />
                                            <p className={`font-black uppercase text-xs ${user.membership?.expiresAt && new Date(user.membership.expiresAt) > new Date() ? 'text-gaming-accent' : 'text-red-500'}`}>
                                                {user.membership?.expiresAt && new Date(user.membership.expiresAt) > new Date() ? 'PRO ACTIVE' : 'EXPIRED'}
                                            </p>
                                        </div>
                                        <p className="text-gray-500 text-[10px] uppercase font-mono mt-1">{user.membership?.challengesUsed || 0} DUELS COMMITTED</p>
                                    </td>
                                    <td className="p-4">
                                        <div className={`flex items-center gap-1.5 text-xs font-black uppercase ${user.isActive ? 'text-green-500' : 'text-red-500'}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${user.isActive ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                                            {user.isActive ? 'Active' : 'Banned'}
                                        </div>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-2 text-white">
                                            <button
                                                onClick={() => setViewingHistory(user)}
                                                className="p-2 hover:bg-gaming-accent/10 rounded-lg text-gaming-accent hover:scale-110 transition-all font-bold"
                                                title="Match History"
                                            >
                                                <History size={18} />
                                            </button>
                                            <button
                                                onClick={() => setEditingUser(user)}
                                                className="p-2 hover:bg-white/10 rounded-lg text-white hover:text-white transition-all font-bold"
                                                title="Edit Profile"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteUser(user.id)}
                                                className="p-2 hover:bg-red-500/10 rounded-lg text-red-400 hover:text-red-300 transition-all font-bold"
                                                title="Ban User"
                                            >
                                                <Ban size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden space-y-4">
                {loading && users.length === 0 ? (
                    <div className="p-12 text-center text-gray-500 italic">Initiating database scan...</div>
                ) : (
                    filteredUsers.map((user) => (
                        <div key={user.id} className="bg-white/5 border border-white/10 p-4 rounded-xl space-y-4">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-gaming-accent/10 border border-gaming-accent/20 flex items-center justify-center text-gaming-accent font-black text-lg">
                                        {user.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-white font-bold">{user.name}</p>
                                        <p className="text-gray-500 text-xs font-mono">@{user.ign}</p>
                                        <p className="text-[10px] text-gaming-accent font-bold uppercase tracking-widest mt-0.5">{user.country || 'Bangladesh'} • {user.district || 'Global'}</p>
                                        <p className="text-gray-600 text-[10px] mt-0.5">{user.email}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded border ${user.membership?.expiresAt && new Date(user.membership.expiresAt) > new Date() ? 'bg-gaming-accent/10 border-gaming-accent/20 text-gaming-accent' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}>
                                        <Zap size={10} fill="currentColor" />
                                        <span className="text-[8px] font-black uppercase tracking-tighter">
                                            {user.membership?.expiresAt && new Date(user.membership.expiresAt) > new Date() ? 'ACTIVE' : 'OFFLINE'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 py-3 border-y border-white/5">
                                <div>
                                    <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Combat Role</p>
                                    <p className="text-sm text-gray-300 font-medium">{user.role}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Status</p>
                                    <div className={`flex items-center gap-1.5 text-[10px] font-black uppercase ${user.isActive ? 'text-green-500' : 'text-red-500'}`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${user.isActive ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                                        {user.isActive ? 'Active' : 'Banned'}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between gap-2 pt-1">
                                <button
                                    onClick={() => setViewingHistory(user)}
                                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-gaming-accent/10 text-gaming-accent rounded-lg text-xs font-bold uppercase transition-colors"
                                >
                                    <History size={14} /> History
                                </button>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setEditingUser(user)}
                                        className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white transition-colors"
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteUser(user.id)}
                                        className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg text-red-500 transition-colors"
                                    >
                                        <Ban size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {!loading && filteredUsers.length === 0 && (
                <div className="p-8 text-center text-gray-500 bg-white/5 border border-white/10 rounded-lg italic">
                    No users found matching "{searchTerm}"
                </div>
            )}

            {/* Match History Modal */}
            {viewingHistory && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                    <div className="bg-[#0c0c12] border border-white/10 w-full max-w-lg rounded-xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] animate-in zoom-in-95 duration-200">
                        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-gradient-to-r from-gaming-accent/10 to-transparent">
                            <div>
                                <h3 className="text-white font-black uppercase tracking-widest text-sm flex items-center gap-2">
                                    <History size={16} className="text-gaming-accent" /> Match Archive: {viewingHistory.ign}
                                </h3>
                                <p className="text-[10px] text-gray-500 uppercase font-bold mt-1 tracking-tighter">Combat logs & Earnings Report</p>
                            </div>
                            <button onClick={() => setViewingHistory(null)} className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-4 max-h-[70vh] overflow-y-auto">
                            <MatchHistory history={viewingHistory.matchHistory || []} />
                        </div>
                        <div className="p-4 bg-white/5 border-t border-white/10 flex justify-end">
                            <button onClick={() => setViewingHistory(null)} className="px-6 py-2 bg-white/5 hover:bg-white/10 text-white rounded font-bold uppercase text-xs transition-colors">Close Log</button>
                        </div>
                    </div>
                </div>
            )}

            {/* User Edit Modal */}
            {editingUser && (
                <UserEditModal
                    user={editingUser}
                    onClose={() => setEditingUser(null)}
                    onSave={loadUsers}
                />
            )}
        </div>
    );
};

export default AdminUsers;
