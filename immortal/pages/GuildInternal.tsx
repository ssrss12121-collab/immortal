import React, { useState, useEffect } from 'react';
import { ChevronLeft, Share2, MessageSquare, Lock, Radio, Plus, Zap, Users, Shield, Copy, Check, Settings } from 'lucide-react';
import { UserProfile } from '../types';
import PullToRefresh from '../components/PullToRefresh';

interface GuildInternalProps {
    guildId: string;
    user: UserProfile;
    onBack: () => void;
    onManage: () => void;
    onNavigateToChat: (type: 'CHANNEL' | 'GROUP', id: string) => void;
    onStartLive: (type: 'SOLO' | 'SLOT', sourceId: string, sourceType: 'CHANNEL' | 'GROUP') => void;
}

const GuildInternal: React.FC<GuildInternalProps> = ({ guildId, user, onBack, onManage, onNavigateToChat, onStartLive }) => {
    const [subTab, setSubTab] = useState<'CHANNELS' | 'GROUPS'>('CHANNELS');
    const [guild, setGuild] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        // Fetch guild data...
        setGuild({
            id: guildId,
            name: 'Immortal Warriors',
            members: 450,
            channels: [
                { id: 'c1', name: 'General Broadcast', description: 'Main public channel', isLive: true },
                { id: 'c2', name: 'War Briefings', description: 'Admin announcements', isLive: false }
            ],
            groups: [
                { id: 'g1', name: 'Alpha Squad', members: 12, isPrivate: true, inviteCode: 'WAR-123' },
                { id: 'g2', name: 'Tactical OPS', members: 8, isPrivate: true, inviteCode: 'OPS-456' }
            ]
        });
        setIsLoading(false);
    }, [guildId]);

    const copyInvite = (code: string) => {
        navigator.clipboard.writeText(`https://immortalzone.xyz/invite/${code}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (isLoading || !guild) return null;

    return (
        <PullToRefresh onRefresh={async () => { }}>
            <div className="pb-28 pt-6 px-4 space-y-6 min-h-screen animate-fade-in relative">
                {/* Header */}
                <div className="flex items-center space-x-2 mb-4">
                    <button onClick={onBack} className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                        <ChevronLeft size={20} className="text-white" />
                    </button>
                    <div className="flex-1">
                        <h1 className="text-xl font-black uppercase italic tracking-tighter text-white">{guild.name}</h1>
                        <p className="text-[9px] text-gaming-accent font-black uppercase tracking-widest">{guild.members} OPERATIVES ACTIVE</p>
                    </div>
                    <div className="flex gap-2">
                        {guild?.ownerId === user?.id && (
                            <button onClick={onManage} className="p-2 bg-white/5 text-gray-400 rounded-lg border border-white/10 hover:text-white transition-colors">
                                <Settings size={18} />
                            </button>
                        )}
                        <button onClick={() => { }} className="p-2 bg-gaming-accent/10 text-gaming-accent rounded-lg border border-gaming-accent/30">
                            <Share2 size={18} />
                        </button>
                    </div>
                </div>

                {/* Internal Tabs */}
                <div className="flex space-x-2 bg-black/40 p-1 clip-corner-sm border border-white/5">
                    <button
                        onClick={() => setSubTab('CHANNELS')}
                        className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest clip-corner-sm transition-all ${subTab === 'CHANNELS' ? 'bg-gaming-accent text-black shadow-lg' : 'text-gray-500 hover:text-white'}`}
                    >
                        📢 Channels
                    </button>
                    <button
                        onClick={() => setSubTab('GROUPS')}
                        className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest clip-corner-sm transition-all ${subTab === 'GROUPS' ? 'bg-gaming-accent text-black shadow-lg' : 'text-gray-500 hover:text-white'}`}
                    >
                        👥 Groups
                    </button>
                </div>

                {subTab === 'CHANNELS' ? (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-1">
                            <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Public Broadcast Hubs</h3>
                            <button className="text-[10px] font-black text-gaming-accent uppercase tracking-widest">+ New</button>
                        </div>
                        {guild.channels.map((ch: any) => (
                            <div key={ch.id} className="bg-[#0c0c12]/60 border border-white/5 p-4 clip-corner-sm flex items-center justify-between hover:bg-[#12121a] transition-all group">
                                <div className="flex-1" onClick={() => onNavigateToChat('CHANNEL', ch.id)}>
                                    <div className="flex items-center gap-2 mb-1">
                                        <MessageSquare size={14} className="text-gray-500" />
                                        <h4 className="text-sm font-bold text-white uppercase group-hover:text-gaming-accent transition-colors">{ch.name}</h4>
                                        {ch.isLive && (
                                            <span className="flex items-center gap-1 bg-red-600 px-1.5 py-0.5 rounded text-[7px] font-black animate-pulse">
                                                <Radio size={8} /> LIVE
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-[10px] text-gray-600 line-clamp-1">{ch.description}</p>
                                </div>
                                <button
                                    onClick={() => onStartLive('SOLO', ch.id, 'CHANNEL')}
                                    className="p-2.5 bg-red-600/10 text-red-500 rounded-lg border border-red-600/20 hover:bg-red-600 hover:text-white transition-all ml-4"
                                >
                                    <Radio size={18} />
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-1">
                            <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Private Tactical Groups</h3>
                            <button className="text-[10px] font-black text-gaming-accent uppercase tracking-widest flex items-center gap-1">
                                <Plus size={12} /> Establish Group
                            </button>
                        </div>
                        {guild.groups.map((gp: any) => (
                            <div key={gp.id} className="bg-[#0c0c12]/60 border border-white/5 p-4 clip-corner-sm space-y-3 hover:bg-[#12121a] transition-all group">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1" onClick={() => onNavigateToChat('GROUP', gp.id)}>
                                        <div className="flex items-center gap-2 mb-1">
                                            <Lock size={12} className="text-orange-500" />
                                            <h4 className="text-sm font-bold text-white uppercase group-hover:text-gaming-accent transition-colors">{gp.name}</h4>
                                        </div>
                                        <div className="flex items-center gap-4 text-[9px] font-mono text-gray-600">
                                            <span className="flex items-center gap-1"><Users size={10} /> {gp.members} MEMBERS</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => onStartLive('SLOT', gp.id, 'GROUP')}
                                            className="p-2.5 bg-gaming-accent/10 text-gaming-accent rounded-lg border border-gaming-accent/20 hover:bg-gaming-accent hover:text-black transition-all"
                                            title="Start Slot-based Live"
                                        >
                                            <Zap size={18} />
                                        </button>
                                        <button
                                            onClick={() => copyInvite(gp.inviteCode)}
                                            className="p-2.5 bg-white/5 text-gray-500 rounded-lg hover:text-white transition-all"
                                            title="Copy Invite Link"
                                        >
                                            {copied ? <Check size={18} className="text-green-500" /> : <Plus size={18} />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                        <div className="p-4 bg-orange-500/5 border border-orange-500/20 rounded-xl">
                            <p className="text-[9px] text-orange-500/80 font-bold uppercase leading-relaxed text-center">
                                Private groups require a direct neural link (invite code) to join.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </PullToRefresh>
    );
};

export default GuildInternal;
