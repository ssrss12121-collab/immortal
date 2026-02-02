import React, { useState, useEffect } from 'react';
import { Plus, Users, Shield, ChevronRight, Search, Heart, MessageSquare, Zap, Check, UserPlus } from 'lucide-react';
import { UserProfile } from '../types';
import PullToRefresh from '../components/PullToRefresh';

interface GuildPageProps {
    user: UserProfile;
    onNavigateToGuild: (guildId: string) => void;
}

const GuildPage: React.FC<GuildPageProps> = ({ user, onNavigateToGuild }) => {
    const [activeTab, setActiveTab] = useState<'MY_GUILDS' | 'DISCOVER'>('MY_GUILDS');
    const [guilds, setGuilds] = useState<any[]>([]); 
    const [isLoading, setIsLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());

    const [newGuild, setNewGuild] = useState({ 
        name: '', 
        description: '', 
        customLink: '' 
    });

    const fetchGuilds = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('battle_arena_user') ? JSON.parse(localStorage.getItem('battle_arena_user')!).token : '';
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/guilds`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setGuilds(data.guilds);
                // Extract following IDs
                const following = new Set<string>();
                data.guilds.forEach((g: any) => {
                    if (g.followers && g.followers.includes(user.id)) {
                        following.add(g._id || g.id);
                    }
                });
                setFollowingIds(following);
            }
        } catch (error) {
            console.error("Failed to fetch guilds", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchGuilds();
    }, []);

    const handleCreateGuild = async () => {
        if (!newGuild.name.trim()) return;
        
        // Auto-generate custom link from name if not provided
        // Backend expects format: TR.username
        const linkPart = newGuild.customLink.trim() || 
            newGuild.name.toLowerCase()
                .replace(/[^a-z0-9]/g, '')
                .substring(0, 20);
        
        const customLink = `TR.${linkPart}`;

        try {
            const token = localStorage.getItem('battle_arena_user') ? JSON.parse(localStorage.getItem('battle_arena_user')!).token : '';
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/guilds`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ ...newGuild, customLink })
            });
            const data = await response.json();
            if (data.success) {
                setShowCreateModal(false);
                setNewGuild({ name: '', description: '', customLink: '' });
                fetchGuilds();
            } else {
                alert(data.message || 'Establishment Failed');
            }
        } catch (err) {
            console.error("Creation error", err);
        }
    };

    const handleFollowToggle = async (guildId: string) => {
        try {
            const token = localStorage.getItem('battle_arena_user') ? JSON.parse(localStorage.getItem('battle_arena_user')!).token : '';
            const isFollowing = followingIds.has(guildId);
            
            const response = await fetch(
                `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/guilds/${guildId}/${isFollowing ? 'unfollow' : 'follow'}`, 
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            
            const data = await response.json();
            if (data.success) {
                // Update local state
                const newFollowing = new Set(followingIds);
                if (isFollowing) {
                    newFollowing.delete(guildId);
                } else {
                    newFollowing.add(guildId);
                }
                setFollowingIds(newFollowing);
                
                // Update guild follower count
                setGuilds(prev => prev.map(g => {
                    if ((g._id || g.id) === guildId) {
                        return {
                            ...g,
                            followerCount: isFollowing ? (g.followerCount || 1) - 1 : (g.followerCount || 0) + 1
                        };
                    }
                    return g;
                }));
            }
        } catch (error) {
            console.error("Follow toggle failed", error);
        }
    };

    const myGuilds = guilds.filter(g => 
        g.ownerId === user.id || 
        (g.members && g.members.some((m: any) => m.userId === user.id))
    );
    
    const discoverGuilds = guilds
        .filter(g => 
            g.ownerId !== user.id && 
            (!g.members || !g.members.some((m: any) => m.userId === user.id))
        )
        .filter(g => 
            !searchQuery || 
            g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            g.description?.toLowerCase().includes(searchQuery.toLowerCase())
        );

    return (
        <PullToRefresh onRefresh={fetchGuilds}>
            <div className="pb-28 pt-6 px-4 space-y-6 min-h-screen animate-fade-in bg-black">
                {/* Header */}
                <div className="flex justify-between items-center bg-[#0c0c12]/80 backdrop-blur-md p-4 clip-corner-sm border border-white/10 cyber-glimmer">
                    <div>
                        <h1 className="text-2xl font-black uppercase italic tracking-tighter text-white">Guild <span className="text-gaming-accent">Network</span></h1>
                        <p className="text-[9px] text-gray-500 font-mono tracking-widest uppercase mt-1">Operational Command Central</p>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="w-12 h-12 bg-gaming-accent text-black flex items-center justify-center rounded-2xl shadow-[0_0_15px_rgba(0,223,130,0.4)] hover:scale-105 transition-transform"
                    >
                        <Plus size={24} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex p-1 bg-black/40 clip-corner-sm border border-white/5">
                    <button
                        onClick={() => setActiveTab('MY_GUILDS')}
                        className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest clip-corner-sm transition-all ${activeTab === 'MY_GUILDS' ? 'bg-white/10 text-white shadow-inner' : 'text-gray-500 hover:text-white'}`}
                    >
                        Operations
                    </button>
                    <button
                        onClick={() => setActiveTab('DISCOVER')}
                        className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest clip-corner-sm transition-all ${activeTab === 'DISCOVER' ? 'bg-white/10 text-white shadow-inner' : 'text-gray-500 hover:text-white'}`}
                    >
                        Intelligence
                    </button>
                </div>

                {activeTab === 'MY_GUILDS' ? (
                    <div className="space-y-4">
                        {myGuilds.length === 0 ? (
                            <div className="py-20 text-center space-y-4">
                                <Users size={48} className="mx-auto text-gray-800 opacity-20" />
                                <p className="text-xs text-gray-600 uppercase font-bold tracking-widest italic">No active deployments found</p>
                                <button onClick={() => setActiveTab('DISCOVER')} className="text-gaming-accent text-[10px] uppercase font-black underline tracking-widest">Enlist in other guilds</button>
                            </div>
                        ) : (
                            myGuilds.map(guild => (
                                <GuildCard 
                                    key={guild._id || guild.id} 
                                    guild={guild} 
                                    onClick={() => onNavigateToGuild(guild._id || guild.id)}
                                    isFollowing={followingIds.has(guild._id || guild.id)}
                                    onFollowToggle={() => handleFollowToggle(guild._id || guild.id)}
                                    showFollowButton={false}
                                />
                            ))
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* Search Bar */}
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder="SEARCH GUILD DIRECTORY..."
                                className="w-full bg-[#0c0c12]/60 border border-white/5 rounded-xl py-4 pl-12 pr-4 text-xs text-white focus:border-gaming-accent outline-none font-mono transition-all placeholder:text-gray-700"
                            />
                        </div>
                        <div className="space-y-4">
                            {discoverGuilds.length === 0 ? (
                                <div className="py-20 text-center">
                                    <Search size={48} className="mx-auto text-gray-800 opacity-20 mb-4" />
                                    <p className="text-xs text-gray-600 uppercase font-bold tracking-widest italic">
                                        {searchQuery ? 'No guilds match your search' : 'No guilds available'}
                                    </p>
                                </div>
                            ) : (
                                discoverGuilds.map(guild => (
                                    <GuildCard 
                                        key={guild._id || guild.id} 
                                        guild={guild} 
                                        onClick={() => onNavigateToGuild(guild._id || guild.id)}
                                        isFollowing={followingIds.has(guild._id || guild.id)}
                                        onFollowToggle={() => handleFollowToggle(guild._id || guild.id)}
                                        showFollowButton={true}
                                    />
                                ))
                            )}
                        </div>
                    </div>
                )}

                {/* Create Guild Modal */}
                {showCreateModal && (
                    <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-50 flex items-center justify-center p-4">
                        <div className="bg-[#0c0c12] border border-white/10 w-full max-w-sm rounded-3xl p-6 space-y-6 cyber-glimmer">
                            <div className="flex justify-between items-center">
                                <h3 className="text-xl font-black italic uppercase tracking-tighter text-white">Initialize Guild</h3>
                                <button onClick={() => setShowCreateModal(false)} className="text-gray-500 hover:text-white"><Zap size={20} /></button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">Codename (Guild Name)</label>
                                    <input
                                        type="text"
                                        value={newGuild.name}
                                        onChange={e => setNewGuild({ ...newGuild, name: e.target.value })}
                                        className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-sm focus:border-gaming-accent outline-none transition-all placeholder:text-gray-700 font-mono text-white"
                                        placeholder="e.g. ALPHA_SQUAD"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">Custom Link (Optional)</label>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-600 font-mono">TR.</span>
                                        <input
                                            type="text"
                                            value={newGuild.customLink}
                                            onChange={e => setNewGuild({ ...newGuild, customLink: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '') })}
                                            className="flex-1 bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-sm focus:border-gaming-accent outline-none transition-all placeholder:text-gray-700 font-mono text-white"
                                            placeholder="alphasquad"
                                            maxLength={20}
                                        />
                                    </div>
                                    <p className="text-[8px] text-gray-600 mt-1 font-mono">Auto-generated if left blank</p>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">Operational Brief (Description)</label>
                                    <textarea
                                        value={newGuild.description}
                                        onChange={e => setNewGuild({ ...newGuild, description: e.target.value })}
                                        className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-sm focus:border-gaming-accent outline-none transition-all placeholder:text-gray-700 font-mono h-24 resize-none text-white"
                                        placeholder="Define your mission objectives..."
                                    />
                                </div>
                                <div className="p-4 bg-gaming-accent/5 border border-gaming-accent/20 rounded-xl space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Shield className="text-gaming-accent" size={14} />
                                        <span className="text-[10px] uppercase font-black text-gaming-accent tracking-widest">Ownership Protocol</span>
                                    </div>
                                    <p className="text-[9px] text-gray-500 uppercase font-bold leading-relaxed">As founder, you will have root access to all channels, groups, and live operations within this guild.</p>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button onClick={() => setShowCreateModal(false)} className="flex-1 py-4 text-gray-500 font-bold uppercase text-[10px] tracking-widest">Abort</button>
                                <button onClick={handleCreateGuild} className="flex-[2] bg-gaming-accent text-black font-black py-4 clip-corner-sm uppercase tracking-[0.2em] text-[10px] shadow-[0_0_20px_rgba(0,223,130,0.3)] hover:scale-[1.02] transition-transform">Establish Guild</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </PullToRefresh>
    );
};

const GuildCard: React.FC<{ 
    guild: any; 
    onClick: () => void;
    isFollowing: boolean;
    onFollowToggle: () => void;
    showFollowButton: boolean;
}> = ({ guild, onClick, isFollowing, onFollowToggle, showFollowButton }) => (
    <div
        className="group bg-[#0c0c12]/60 hover:bg-[#12121a] border border-white/5 hover:border-gaming-accent/30 p-4 clip-corner-sm transition-all relative overflow-hidden"
    >
        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-gaming-accent/5 to-transparent skew-x-12 -translate-y-4 translate-x-4"></div>

        <div className="flex items-center space-x-4 relative z-10">
            <div 
                onClick={onClick}
                className="w-14 h-14 bg-black border border-white/10 clip-corner-sm overflow-hidden p-1 shadow-[0_0_15px_rgba(255,255,255,0.05)] group-hover:border-gaming-accent/50 transition-colors cursor-pointer"
            >
                <img 
                    src={guild.logo || `https://api.dicebear.com/7.x/shapes/svg?seed=${guild.name}`} 
                    alt={guild.name} 
                    className="w-full h-full object-cover clip-corner-sm" 
                />
            </div>
            <div className="flex-1 cursor-pointer" onClick={onClick}>
                <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-black uppercase text-white group-hover:text-gaming-accent transition-colors tracking-wide">{guild.name}</h3>
                    {guild.isVerified && <span className="text-[8px] bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded uppercase font-black">✓ VERIFIED</span>}
                </div>
                <p className="text-[10px] text-gray-500 line-clamp-1 mb-2 font-medium">{guild.description || 'No description'}</p>
                <div className="flex items-center space-x-4 text-[9px] font-mono uppercase font-bold text-gray-600">
                    <span className="flex items-center gap-1"><Users size={10} /> {guild.members?.length || 0} UNITS</span>
                    <span className="flex items-center gap-1"><Heart size={10} /> {guild.followerCount || 0} Intel</span>
                </div>
            </div>
            {showFollowButton ? (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onFollowToggle();
                    }}
                    className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                        isFollowing 
                            ? 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10' 
                            : 'bg-gaming-accent text-black shadow-[0_0_10px_rgba(0,223,130,0.3)] hover:scale-105'
                    }`}
                >
                    {isFollowing ? <><Check size={12} className="inline mr-1" />Following</> : <><UserPlus size={12} className="inline mr-1" />Follow</>}
                </button>
            ) : (
                <ChevronRight size={18} className="text-gray-700 group-hover:text-gaming-accent transition-all translate-x-0 group-hover:translate-x-1" />
            )}
        </div>
    </div>
);

export default GuildPage;
