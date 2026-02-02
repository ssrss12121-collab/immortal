import React, { useState, useEffect } from 'react';
import { UserProfile } from '../../types';
import { Search, Plus, Trash2, User, AlertTriangle } from 'lucide-react';
import { getFeaturedPlayerIds, addFeaturedPlayer, removeFeaturedPlayer } from '../../utils/featuredStorage';
import { getUserById, getAllUsers } from '../../utils/auth';

const AdminFeaturedPlayers: React.FC = () => {
    const [featuredPlayers, setFeaturedPlayers] = useState<UserProfile[]>([]);
    const [newId, setNewId] = useState('');
    const [searchedUser, setSearchedUser] = useState<UserProfile | null>(null);
    const [error, setError] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const ids = await getFeaturedPlayerIds();
            const users = await Promise.all(ids.map(id => getUserById(id)));
            setFeaturedPlayers(users.filter((u): u is UserProfile => u !== null));
        } catch (error) {
            console.error('Failed to load featured players', error);
        }
    };

    const handleSearch = async () => {
        setError('');
        setSearchedUser(null);
        if (!newId.trim()) return;

        try {
            const allUsers = await getAllUsers();
            const found = allUsers.find((u: UserProfile) => u.id === newId.trim() || u.ign === newId.trim());

            if (found) {
                setSearchedUser(found);
            } else {
                setError('User not found');
            }
        } catch (err) {
            setError('Error searching user');
        }
    };

    const handleAdd = async () => {
        if (searchedUser) {
            try {
                await addFeaturedPlayer(searchedUser.id);
                setNewId('');
                setSearchedUser(null);
                loadData();
            } catch (error) {
                alert('Failed to add featured player');
            }
        }
    };

    const handleRemove = async (id: string) => {
        try {
            await removeFeaturedPlayer(id);
            loadData();
        } catch (error) {
            alert('Failed to remove player');
        }
    };

    return (
        <div className="space-y-6 animate-fade-in text-white">
            <h2 className="text-xl md:text-2xl font-bold text-white mb-6">Featured Players Management</h2>

            {/* Add Section */}
            <div className="bg-white/5 border border-white/10 p-4 sm:p-6 rounded-xl">
                <h3 className="text-base sm:text-lg font-bold text-white mb-4">Add Player to Spotlight</h3>
                <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-start">
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            value={newId}
                            onChange={(e) => setNewId(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white font-mono text-sm focus:border-blue-500 focus:outline-none transition-colors"
                            placeholder="Enter User ID or Gamer ID..."
                        />
                        {error && <p className="text-red-500 text-[10px] mt-1.5 font-bold uppercase tracking-wide flex items-center gap-1"><AlertTriangle size={10} /> {error}</p>}
                    </div>
                    <button
                        onClick={handleSearch}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-lg flex items-center justify-center gap-2 font-bold transition-all shadow-lg active:scale-95"
                    >
                        <Search size={16} /> <span className="text-xs uppercase">Verify ID</span>
                    </button>
                </div>

                {searchedUser && (
                    <div className="mt-6 bg-[#0c0c12] p-4 rounded-xl border border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4 animate-in zoom-in-95 duration-200">
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            <div className="w-12 h-12 rounded-lg overflow-hidden border border-white/10 bg-gray-900 group relative">
                                <img src={searchedUser.avatarUrl || `https://ui-avatars.com/api/?name=${searchedUser.ign}&background=random`} alt={searchedUser.ign} className="w-full h-full object-cover" />
                            </div>
                            <div>
                                <p className="text-white font-black text-sm uppercase tracking-tight">{searchedUser.ign}</p>
                                <p className="text-[10px] text-gray-500 font-mono italic">#{searchedUser.id}</p>
                            </div>
                        </div>
                        <button
                            onClick={handleAdd}
                            className="w-full sm:w-auto bg-gaming-accent text-black px-6 py-2.5 rounded-lg font-black uppercase text-[10px] tracking-widest hover:bg-gaming-accent/90 flex items-center justify-center gap-2 shadow-[0_4px_15px_rgba(0,255,157,0.2)]"
                        >
                            <Plus size={16} /> Deploy to Spotlight
                        </button>
                    </div>
                )}
            </div>

            {/* List Section */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-bold text-white italic">Current Hall of Fame</h3>
                    <div className="flex-1 h-[1px] bg-white/5"></div>
                </div>

                {featuredPlayers.length === 0 ? (
                    <div className="text-center py-12 text-gray-600 border border-white/5 border-dashed rounded-xl">
                        <User size={32} className="mx-auto mb-2 opacity-10" />
                        <p className="text-[10px] uppercase font-black tracking-widest">No players currently deployed</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {featuredPlayers.map(user => (
                            <div key={user.id} className="bg-white/5 p-3 rounded-xl border border-white/10 flex justify-between items-center group hover:bg-white/[0.08] transition-all">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-10 h-10 rounded-lg bg-black/50 overflow-hidden border border-white/10 flex-shrink-0">
                                        <img src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.ign}&background=random`} className="w-full h-full object-cover" alt="" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-white font-bold text-sm truncate group-hover:text-gaming-accent transition-colors">{user.ign}</p>
                                        <p className="text-[9px] text-gray-600 font-mono uppercase">Level {user.level || 1} • {user.role}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleRemove(user.id)}
                                    className="text-gray-600 hover:text-red-500 p-2.5 rounded-lg hover:bg-red-500/10 transition-all active:scale-90"
                                    title="Remove from Featured"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminFeaturedPlayers;
