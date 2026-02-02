import React, { useState, useEffect } from 'react';
import { ChevronLeft, Plus, Settings, Users, MessageSquare, Lock, Radio, Shield, Trash2, Check, X, Save, Zap } from 'lucide-react';
import axios from 'axios';
import { UserProfile } from '../types';

interface GuildManagementProps {
    guildId: string;
    user: UserProfile;
    onBack: () => void;
}

const GuildManagement: React.FC<GuildManagementProps> = ({ guildId, user, onBack }) => {
    const [guild, setGuild] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'MEMBERS' | 'CHANNELS' | 'GROUPS'>('OVERVIEW');
    const [isLoading, setIsLoading] = useState(true);
    const [guildData, setGuildData] = useState<any>(null);

    useEffect(() => {
        const fetchGuild = async () => {
            try {
                const res = await axios.get(`/api/guilds/${guildId}`);
                if (res.data.success) {
                    setGuild(res.data.guild);
                    setGuildData({
                        name: res.data.guild.name,
                        description: res.data.guild.description,
                        logoUrl: res.data.guild.logoUrl,
                        bannerUrl: res.data.guild.bannerUrl
                    });
                }
            } catch (err) { console.error(err); }
            setIsLoading(false);
        };
        fetchGuild();
    }, [guildId]);

    const handleUpdateGuild = async () => {
        try {
            await axios.put(`/api/guilds/${guildId}`, guildData);
            alert('GUILD PARAMETERS UPDATED');
        } catch (err) { alert('UPDATE FAILED'); }
    };

    const handleApprove = async (userId: string) => {
        try {
            await axios.post(`/api/guilds/${guildId}/approve/${userId}`);
            setGuild((prev: any) => ({
                ...prev,
                pendingJoinRequests: prev.pendingJoinRequests.filter((u: any) => u._id !== userId),
                members: [...prev.members, { userId, role: 'Member' }]
            }));
        } catch (err) { alert('APPROVAL FAILED'); }
    };

    const handleReject = async (userId: string) => {
        try {
            await axios.post(`/api/guilds/${guildId}/reject/${userId}`);
            setGuild((prev: any) => ({
                ...prev,
                pendingRequests: prev.pendingRequests.filter((u: any) => u.userId !== userId),
            }));
        } catch (err) { alert('REJECTION FAILED'); }
    };

    const handleCreateChannel = async (name: string, description: string) => {
        try {
            const res = await axios.post(`/api/guilds/${guildId}/channels`, { name, description });
            if (res.data.success) {
                setGuild((prev: any) => ({
                    ...prev,
                    channels: [...prev.channels, res.data.channel]
                }));
            }
        } catch (err) { alert('CREATION FAILED'); }
    };

    if (isLoading || !guild) return null;

    return (
        <div className="pb-28 pt-6 px-4 space-y-6 min-h-screen animate-fade-in bg-black">
            {/* Header */}
            <div className="flex items-center space-x-2 mb-4">
                <button onClick={onBack} className="p-2 bg-white/5 rounded-lg">
                    <ChevronLeft size={20} className="text-white" />
                </button>
                <div className="flex-1">
                    <h1 className="text-xl font-black uppercase italic tracking-tighter text-white">Manage Guild</h1>
                    <p className="text-[9px] text-gaming-accent font-black uppercase tracking-widest">{guild.name}</p>
                </div>
            </div>

            {/* Management Tabs */}
            <div className="flex space-x-2 bg-[#0c0c12] p-1 clip-corner-sm border border-white/5 overflow-x-auto scrollbar-hide">
                {['OVERVIEW', 'MEMBERS', 'CHANNELS', 'GROUPS'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab as any)}
                        className={`flex-none px-4 py-2.5 text-[9px] font-black uppercase tracking-widest clip-corner-sm transition-all ${activeTab === tab ? 'bg-gaming-accent text-black shadow-lg' : 'text-gray-500 hover:text-white'}`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {activeTab === 'OVERVIEW' && (
                <div className="space-y-6 animate-fade-in">
                    <div className="bg-[#0c0c12] border border-white/5 p-6 clip-corner-sm space-y-4">
                        <h3 className="text-sm font-black uppercase text-white tracking-widest flex items-center gap-2">
                            <Settings size={16} className="text-gaming-accent" /> Base Parameters
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-bold text-gray-500 uppercase block mb-2">Guild Name</label>
                                <input type="text" defaultValue={guild.name} className="w-full bg-black border border-white/10 rounded-xl p-4 text-xs text-white" />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-gray-500 uppercase block mb-2">Description</label>
                                <textarea defaultValue={guild.description} className="w-full bg-black border border-white/10 rounded-xl p-4 text-xs text-white h-24 resize-none" />
                            </div>
                            <button className="w-full py-4 bg-gaming-accent text-black font-black uppercase text-[10px] tracking-[0.2em] clip-corner-sm shadow-lg">Save Changes</button>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'MEMBERS' && (
                <div className="space-y-6 animate-fade-in">
                    {/* Join Requests */}
                    {guild.pendingRequests.length > 0 && (
                        <div className="space-y-3">
                            <h3 className="text-[10px] font-black text-orange-500 uppercase tracking-widest px-1">Engagement Requests ({guild.pendingRequests.length})</h3>
                            {guild.pendingRequests.map((req: any) => (
                                <div key={req.userId} className="bg-orange-500/5 border border-orange-500/20 p-4 clip-corner-sm flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-black border border-orange-500/30 rounded-lg overflow-hidden p-1">
                                            <img src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${req.userId}`} className="w-full h-full" />
                                        </div>
                                        <span className="text-xs font-bold text-white uppercase">{req.ign}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="p-2 bg-green-600/20 text-green-500 rounded-lg border border-green-600/30"><Check size={16} /></button>
                                        <button className="p-2 bg-red-600/20 text-red-500 rounded-lg border border-red-600/30"><X size={16} /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Member List */}
                    <div className="space-y-3">
                        <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Active Operatives</h3>
                        {guild.members.map((member: any) => (
                            <div key={member.userId} className="bg-[#0c0c12] border border-white/5 p-4 clip-corner-sm flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-black border border-white/10 rounded-lg overflow-hidden p-1">
                                        <img src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${member.userId}`} className="w-full h-full" />
                                    </div>
                                    <div>
                                        <span className="text-xs font-bold text-white uppercase block">{member.ign}</span>
                                        <span className={`text-[8px] font-black px-1 rounded uppercase ${member.role === 'Owner' ? 'bg-gaming-accent/10 text-gaming-accent' : 'bg-white/5 text-gray-500'}`}>{member.role}</span>
                                    </div>
                                </div>
                                {member.role !== 'Owner' && (
                                    <button className="p-2 text-gray-700 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'CHANNELS' && (
                <div className="space-y-4 animate-fade-in">
                    <button className="w-full py-4 border-2 border-dashed border-white/10 rounded-2xl flex items-center justify-center gap-2 text-gray-500 hover:border-gaming-accent hover:text-gaming-accent transition-all group">
                        <Plus size={20} className="group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Establish New Channel</span>
                    </button>
                    {guild.channels.map((ch: any) => (
                        <div key={ch.id} className="bg-[#0c0c12] border border-white/5 p-4 clip-corner-sm flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <MessageSquare size={18} className="text-gaming-accent" />
                                <span className="text-xs font-bold text-white uppercase">{ch.name}</span>
                            </div>
                            <div className="flex gap-2">
                                <button className="p-2 text-gray-600 hover:text-white"><Settings size={16} /></button>
                                <button className="p-2 text-gray-600 hover:text-red-500"><Trash2 size={16} /></button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {activeTab === 'GROUPS' && (
                <div className="space-y-4 animate-fade-in">
                    <button className="w-full py-4 border-2 border-dashed border-white/10 rounded-2xl flex items-center justify-center gap-2 text-gray-500 hover:border-orange-500 hover:text-orange-500 transition-all group">
                        <Lock size={18} className="group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Construct Private Group</span>
                    </button>
                    {guild.groups.map((gp: any) => (
                        <div key={gp.id} className="bg-[#0c0c12] border border-white/5 p-4 clip-corner-sm flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Shield size={18} className="text-orange-500" />
                                <span className="text-xs font-bold text-white uppercase">{gp.name}</span>
                            </div>
                            <div className="flex gap-2">
                                <button className="p-2 text-gray-600 hover:text-white"><Settings size={16} /></button>
                                <button className="p-2 text-gray-600 hover:text-red-500"><Trash2 size={16} /></button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default GuildManagement;
