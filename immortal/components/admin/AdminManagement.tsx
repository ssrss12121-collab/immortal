import React, { useState, useEffect } from 'react';
import { UserPlus, Shield, Trophy, Trash2, Edit2, ToggleLeft, ToggleRight, Search } from 'lucide-react';
import { getAllAdmins, AdminUser, deleteAdmin } from '../../utils/adminStorage';
import { getCurrentAdmin } from '../../utils/adminAuth';
import { getTournaments } from '../../utils/tournamentStorage';
import AddAdminModal from './AddAdminModal';

const AdminManagement: React.FC = () => {
    const [admins, setAdmins] = useState<AdminUser[]>([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState<'all' | AdminUser['role']>('all');
    const currentAdmin = getCurrentAdmin();

    useEffect(() => {
        loadAdmins();
    }, []);

    const loadAdmins = async () => {
        try {
            const data = await getAllAdmins();
            setAdmins(data);
        } catch (error) {
            console.error('Failed to load admins');
        }
    };

    const handleDelete = async (id: string, username: string) => {
        if (confirm(`Are you sure you want to remove admin privileges from "${username}"?`)) {
            try {
                await deleteAdmin(id);
                loadAdmins();
            } catch (error) {
                alert('Failed to remove admin.');
            }
        }
    };

    const handleToggleStatus = (id: string) => {
        alert("Status toggling is managed via Role assignments in this version.");
    };

    const getRoleBadge = (role: AdminUser['role']) => {
        switch (role) {
            case 'super_admin':
                return <span className="px-2 py-1 rounded text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/30">SUPER ADMIN</span>;
            case 'tournament_admin':
                return <span className="px-2 py-1 rounded text-xs font-bold bg-gaming-accent/20 text-gaming-accent border border-gaming-accent/30">TOURNAMENT ADMIN</span>;
            case 'challenge_admin':
                return <span className="px-2 py-1 rounded text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">CHALLENGE ADMIN</span>;
            case 'banner_admin':
                return <span className="px-2 py-1 rounded text-xs font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30">BANNER ADMIN</span>;
            case 'content_admin':
                return <span className="px-2 py-1 rounded text-xs font-bold bg-gaming-accent/20 text-gaming-accent border border-gaming-accent/30">CONTENT ADMIN</span>;
            case 'user_admin':
                return <span className="px-2 py-1 rounded text-xs font-bold bg-pink-500/20 text-pink-400 border border-pink-500/30">USER ADMIN</span>;
        }
    };

    const [tournamentNames, setTournamentNames] = useState<Record<string, string>>({});

    useEffect(() => {
        const fetchTournamentNames = async () => {
            try {
                const tournaments = await getTournaments();
                if (Array.isArray(tournaments)) {
                    const names: Record<string, string> = {};
                    tournaments.forEach(t => {
                        const id = t.id || t._id;
                        if (t && id) names[id] = t.title;
                    });
                    setTournamentNames(names);
                }
            } catch (err) {
                console.error('Error fetching tournaments for names:', err);
            }
        };
        fetchTournamentNames();
    }, []);

    const getTournamentNames = (tournamentIds?: string[]) => {
        if (!tournamentIds || tournamentIds.length === 0) return 'None';
        return tournamentIds
            .map(id => tournamentNames[id])
            .filter(Boolean)
            .join(', ') || 'None';
    };

    const filteredAdmins = admins.filter(admin => {
        const matchesSearch =
            (admin.username && admin.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (admin.email && admin.email.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesRole = filterRole === 'all' || admin.role === filterRole;

        return matchesSearch && matchesRole;
    });

    return (
        <div className="space-y-6 animate-fade-in text-white">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-xl md:text-2xl font-bold text-white">Admin Management</h2>
                    <p className="text-[10px] md:text-xs text-gray-500 uppercase font-bold tracking-widest mt-1">Authority controls & permission matrix</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="w-full sm:w-auto bg-gaming-accent text-black px-6 py-2.5 rounded-lg font-bold hover:bg-gaming-accent/90 transition-all flex items-center justify-center gap-2 shadow-[0_4px_15px_rgba(0,255,157,0.2)] active:scale-95"
                >
                    <UserPlus size={18} />
                    Add Admin
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search admins..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-gaming-accent text-sm"
                    />
                </div>

                <select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value as any)}
                    className="bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-gaming-accent text-sm"
                >
                    <option value="all" className="bg-[#1a1a24]">All Roles</option>
                    <option value="super_admin" className="bg-[#1a1a24]">Super Admin</option>
                    <option value="tournament_admin" className="bg-[#1a1a24]">Tournament Admin</option>
                    <option value="challenge_admin" className="bg-[#1a1a24]">Challenge Admin</option>
                    <option value="banner_admin" className="bg-[#1a1a24]">Banner Admin</option>
                    <option value="content_admin" className="bg-[#1a1a24]">Content Admin</option>
                    <option value="user_admin" className="bg-[#1a1a24]">User Admin</option>
                </select>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-red-500/10 to-red-500/5 border border-red-500/20 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[10px] text-gray-500 uppercase font-black">Level 3 Admins</p>
                            <p className="text-2xl font-black text-red-500 mt-1">
                                {admins.filter(a => a.role === 'super_admin').length}
                            </p>
                        </div>
                        <Shield size={32} className="text-red-500/30" />
                    </div>
                </div>

                <div className="bg-gradient-to-br from-gaming-accent/10 to-gaming-accent/5 border border-gaming-accent/20 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[10px] text-gray-500 uppercase font-black">Event Authorities</p>
                            <p className="text-2xl font-black text-gaming-accent mt-1">
                                {admins.filter(a => a.role === 'tournament_admin').length}
                            </p>
                        </div>
                        <Trophy size={32} className="text-gaming-accent/30" />
                    </div>
                </div>

                <div className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20 rounded-xl p-4 sm:col-span-2 lg:col-span-1">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[10px] text-gray-500 uppercase font-black">Duel Overseers</p>
                            <p className="text-2xl font-black text-blue-400 mt-1">
                                {admins.filter(a => a.role === 'challenge_admin').length}
                            </p>
                        </div>
                        <Shield size={32} className="text-blue-400/30" />
                    </div>
                </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block bg-white/5 border border-white/10 rounded-xl overflow-hidden shadow-2xl">
                <table className="w-full text-left">
                    <thead className="bg-black/40 text-gray-400 text-[10px] uppercase tracking-widest font-black">
                        <tr>
                            <th className="p-4">Authority Profile</th>
                            <th className="p-4">Assigned Rank</th>
                            <th className="p-4">Sector Access</th>
                            <th className="p-4 text-right">Operation status</th>
                            <th className="p-4 text-right">Execution</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {filteredAdmins.map((admin) => (
                            <tr key={admin._id || admin.id || Math.random()} className="hover:bg-gaming-accent/[0.02] transition-colors group">
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white font-black group-hover:border-gaming-accent/50 group-hover:text-gaming-accent transition-all">
                                            {admin.username.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-white font-bold group-hover:text-gaming-accent transition-colors">{admin.username}</p>
                                            <p className="text-gray-500 text-[10px] font-mono">{admin.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4">
                                    {getRoleBadge(admin.role)}
                                </td>
                                <td className="p-4">
                                    <div className="text-[10px] text-gray-400 max-w-xs font-bold uppercase tracking-tighter">
                                        {admin.role === 'tournament_admin' ? (
                                            <p className="truncate" title={getTournamentNames(admin.permissions.tournaments)}>
                                                {getTournamentNames(admin.permissions.tournaments)}
                                            </p>
                                        ) : admin.role === 'challenge_admin' ? (
                                            <p className="text-blue-400">All Live Challenges</p>
                                        ) : admin.role === 'banner_admin' ? (
                                            <p className="text-purple-400">Marketing Assets</p>
                                        ) : admin.role === 'content_admin' ? (
                                            <p className="text-gaming-accent">Platform Intel</p>
                                        ) : admin.role === 'user_admin' ? (
                                            <p className="text-pink-400">Player Archives</p>
                                        ) : (
                                            <p className="text-red-500 italic">Unlimited Core Access</p>
                                        )}
                                    </div>
                                </td>
                                <td className="p-4 text-right">
                                    <div className={`flex items-center justify-end gap-1.5 text-[10px] font-black uppercase ${admin.isActive ? 'text-green-500' : 'text-red-500'}`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${admin.isActive ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                                        {admin.isActive ? 'On duty' : 'Suspended'}
                                    </div>
                                </td>
                                <td className="p-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        {admin.role !== 'super_admin' && (
                                            <button
                                                onClick={() => handleDelete(admin.id, admin.username)}
                                                className="p-2 hover:bg-red-500/10 rounded-lg text-red-500 transition-all hover:scale-110"
                                                title="Delete Admin"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        )}
                                        {admin.role === 'super_admin' && (
                                            <Shield size={18} className="text-white/10" />
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden space-y-4">
                {filteredAdmins.map((admin) => (
                    <div key={admin.id} className="bg-white/5 border border-white/10 p-4 rounded-xl space-y-4">
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white font-black text-lg">
                                    {admin.username.charAt(0)}
                                </div>
                                <div>
                                    <p className="text-white font-bold">{admin.username}</p>
                                    <p className="text-gray-500 text-[10px] font-mono">{admin.email}</p>
                                </div>
                            </div>
                            {getRoleBadge(admin.role)}
                        </div>

                        <div className="space-y-3 py-3 border-y border-white/5">
                            <div>
                                <p className="text-[10px] text-gray-500 uppercase font-black mb-1">Sector Access</p>
                                <div className="text-xs text-gray-300 font-medium">
                                    {admin.role === 'tournament_admin' ? (
                                        <p>{getTournamentNames(admin.permissions.tournaments)}</p>
                                    ) : admin.role === 'challenge_admin' ? (
                                        <p className="text-blue-400">All Live Challenges</p>
                                    ) : admin.role === 'banner_admin' ? (
                                        <p className="text-purple-400">Marketing Assets</p>
                                    ) : admin.role === 'content_admin' ? (
                                        <p className="text-gaming-accent">Platform Intel</p>
                                    ) : admin.role === 'user_admin' ? (
                                        <p className="text-pink-400">Player Archives</p>
                                    ) : (
                                        <p className="text-red-500 italic">Unlimited Core Access</p>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <p className="text-[10px] text-gray-500 uppercase font-black">Status</p>
                                <div className={`flex items-center gap-1.5 text-[10px] font-black uppercase ${admin.isActive ? 'text-green-500' : 'text-red-500'}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${admin.isActive ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                                    {admin.isActive ? 'On duty' : 'Suspended'}
                                </div>
                            </div>
                        </div>

                        {admin.role !== 'super_admin' && (
                            <button
                                onClick={() => handleDelete(admin.id, admin.username)}
                                className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-500 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
                            >
                                <Trash2 size={16} /> Terminate Access
                            </button>
                        )}
                    </div>
                ))}
            </div>

            {filteredAdmins.length === 0 && (
                <div className="p-12 text-center text-gray-500 bg-white/5 border border-white/10 rounded-xl italic">
                    {searchTerm || filterRole !== 'all' ? (
                        <p>No authority units located in sector scan.</p>
                    ) : (
                        <p>Sector is currently unmonitored. Deploy first admin unit.</p>
                    )}
                </div>
            )}

            {/* Add Admin Modal */}
            {showAddModal && currentAdmin && (
                <AddAdminModal
                    onClose={() => setShowAddModal(false)}
                    onSuccess={loadAdmins}
                    currentAdminId={currentAdmin.id}
                />
            )}
        </div>
    );
};

export default AdminManagement;
