import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { UserProfile, Team, TeamInvite } from '../types';
import { Shield, Users, Plus, Save, X, Search, UserPlus, Check, Trash2, AlertTriangle, MessageSquare, Mic, Send, MoreVertical, Crown, Settings as SettingsIcon, Image as ImageIcon, LogOut, ArrowRightLeft, Copy, Youtube, Eye, Radio, Clock, Calendar, Play, RefreshCcw } from 'lucide-react';
import { socketService } from '../utils/socketService';
import { getTeamByUserId, getMyInvites, createTeam, deleteTeam } from '../utils/teamStorage';
import { auth } from '../utils/auth';
import { chatApi } from '../utils/chat';
import PullToRefresh from '../components/PullToRefresh';
import TeamCallOverlay from '../components/TeamCallOverlay';

interface TeamManagerProps {
    user: UserProfile;
    onUpdateUser: (user: UserProfile) => void;
    onBack: () => void;
    onChatToggle?: (isActive: boolean) => void;
}

const TeamManager: React.FC<TeamManagerProps> = ({ user, onUpdateUser, onBack, onChatToggle }) => {
    const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'CHAT' | 'SETTINGS'>(user.teamId ? 'OVERVIEW' : 'OVERVIEW');
    const [team, setTeam] = useState<Team | null>(null);
    const [chats, setChats] = useState<any[]>([]);
    const [chatInput, setChatInput] = useState('');
    const chatEndRef = useRef<HTMLDivElement>(null);

    // Team Settings State
    const [inviteUid, setInviteUid] = useState('');
    const [inviteMsg, setInviteMsg] = useState('');
    const [bannerPreview, setBannerPreview] = useState('');
    const [logoPreview, setLogoPreview] = useState('');
    const [myInvites, setMyInvites] = useState<any[]>([]);

    // Chat State
    const [editingMsgId, setEditingMsgId] = useState<string | null>(null);
    const [editContent, setEditContent] = useState('');
    const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(new Set());
    const [onlineCount, setOnlineCount] = useState(0);
    const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
    const [replyingTo, setReplyingTo] = useState<any>(null);
    const typingTimeoutRef = useRef<{ [userId: string]: NodeJS.Timeout }>({});

    // Creation Form State
    const [isCreating, setIsCreating] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [formFullName, setFormFullName] = useState('');
    const [formShortName, setFormShortName] = useState('');
    const [formLogo, setFormLogo] = useState('');
    const [copiedId, setCopiedId] = useState(false);
    const [isCalling, setIsCalling] = useState(false);

    useEffect(() => {
        if (onChatToggle) onChatToggle(activeTab === 'CHAT');
    }, [activeTab, onChatToggle]);

    useEffect(() => {
        const handleChatMessage = (msg: any) => {
            if (team && msg.teamId === (team.id || team._id)) {
                setChats(prev => {
                    const filtered = msg.tempId ? prev.filter(m => m.tempId !== msg.tempId) : prev;
                    if (filtered.some(m => (m.id === msg.id || m._id === msg.id))) return filtered;
                    return [...filtered, msg];
                });
                setTimeout(scrollToBottom, 100);
            }
        };

        const handleMessageUpdate = (updatedMsg: any) => {
            setChats(prev => prev.map(m => (m.id === updatedMsg.id || m._id === updatedMsg._id) ? updatedMsg : m));
        };

        const handleMessageDelete = (messageId: string) => {
            setChats(prev => prev.filter(m => (m.id !== messageId && m._id !== messageId)));
        };

        const handleTeamUpdate = (updatedTeam: Team) => {
            const teamId = team?.id || team?._id;
            if (teamId && (teamId === updatedTeam._id || teamId === updatedTeam.id)) {
                setTeam(updatedTeam);
            }
        };

        const handleTeamDisbanded = (data: { teamId: string }) => {
            const teamId = team?.id || team?._id;
            if (teamId === data.teamId) {
                alert('SQUAD DISBANDED: Command has been terminated.');
                onUpdateUser({ ...user, teamId: undefined });
                setTeam(null);
                onBack();
            }
        };

        const handlePresenceUpdate = (data: { userId: string, status: 'online' | 'offline' }) => {
            setOnlineUserIds(prev => {
                const next = new Set(prev);
                if (data.status === 'online') next.add(data.userId);
                else next.delete(data.userId);
                return next;
            });
        };

        const handleOnlineList = (list: string[]) => {
            setOnlineUserIds(new Set(list));
        };

        const handleOnlineCount = (data: { count: number }) => {
            setOnlineCount(data.count);
        };

        const handleUserTyping = (data: { userId: string, senderName: string }) => {
            if (data.userId === user.id) return;
            setTypingUsers(prev => new Set(prev).add(data.senderName));

            if (typingTimeoutRef.current[data.userId]) {
                clearTimeout(typingTimeoutRef.current[data.userId]);
            }

            typingTimeoutRef.current[data.userId] = setTimeout(() => {
                setTypingUsers(prev => {
                    const next = new Set(prev);
                    next.delete(data.senderName);
                    return next;
                });
                delete typingTimeoutRef.current[data.userId];
            }, 3000);
        };

        // Socket Listeners
        if (socketService.socket) {
            socketService.socket.on('team-message-received', handleChatMessage);
            socketService.socket.on('team-message-updated', handleMessageUpdate);
            socketService.socket.on('team-message-deleted', handleMessageDelete);
            socketService.socket.on('team-updated', handleTeamUpdate);
            socketService.socket.on('team-disbanded', handleTeamDisbanded);
            socketService.socket.on('user-presence-update', handlePresenceUpdate);
            socketService.socket.on('team-online-list', handleOnlineList);
            socketService.socket.on('user-typing', handleUserTyping);
            socketService.socket.on('team-online-count', handleOnlineCount);
        }

        loadTeamData();

        return () => {
            if (socketService.socket) {
                socketService.socket.off('team-message-received', handleChatMessage);
                socketService.socket.off('team-message-updated', handleMessageUpdate);
                socketService.socket.off('team-message-deleted', handleMessageDelete);
                socketService.socket.off('team-updated', handleTeamUpdate);
                socketService.socket.off('team-disbanded', handleTeamDisbanded);
                socketService.socket.off('user-presence-update', handlePresenceUpdate);
                socketService.socket.off('team-online-list', handleOnlineList);
                socketService.socket.off('user-typing', handleUserTyping);
                socketService.socket.off('team-online-count', handleOnlineCount);
            }
            if (onChatToggle) onChatToggle(false);

            // Cleanup typing timeouts
            Object.values(typingTimeoutRef.current).forEach((timeout: any) => clearTimeout(timeout));
        };
    }, [user.id, user.teamId, team?.id, team?._id]);

    useEffect(() => {
        if (team?.id || team?._id) {
            const teamId = team.id || team._id;
            socketService.joinTeamRoom(teamId);
            loadChatHistory(teamId);
        }
    }, [team?.id, team?._id]);

    const loadChatHistory = async (teamId: string) => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/chat/history`, {
                params: { teamId }
            });
            if (res.data.success) {
                setChats(res.data.messages);
                setTimeout(scrollToBottom, 200);
            }
        } catch (error) {
            console.error('Failed to load chat history', error);
        }
    };

    useEffect(() => {
        if (onChatToggle) {
            onChatToggle(activeTab === 'CHAT');
        }
    }, [activeTab]);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const loadTeamData = async (ignoreCache = false) => {
        setIsLoading(true);
        try {
            const data = await getTeamByUserId(user.id, ignoreCache);
            setTeam(data);
        } catch (error) {
            console.error('Failed to load team', error);
        } finally {
            setIsLoading(false);
        }

        try {
            const invites = await getMyInvites(user.id);
            setMyInvites(invites);
        } catch (error) {
            console.error('Failed to load invites', error);
        }
    };

    const handleAcceptInvite = async (inviteId: string) => {
        const invite = myInvites.find(i => i.id === inviteId || i._id === inviteId);
        if (invite && invite.teamId) {
            try {
                await socketService.acceptInviteAPI(inviteId, invite.teamId, user.id);
                window.dispatchEvent(new Event('user-session-update'));
                await loadTeamData();
                setActiveTab('OVERVIEW');
            } catch (error: any) {
                alert('Failed to accept invite');
            }
        }
    };

    const handleRejectInvite = async (inviteId: string) => {
        try {
            await socketService.rejectInviteAPI(inviteId);
            await loadTeamData();
        } catch (error: any) {
            console.error("Failed to reject", error);
        }
    };

    const handleCreateTeam = async (e: React.FormEvent) => {
        e.preventDefault();

        if (auth.isGuest(user)) {
            alert("REGISTRATION REQUIRED: Please create a full account to form Squads.");
            return;
        }

        if (!formFullName.trim() || !formShortName.trim()) {
            alert("PROTOCOL ERROR: Squad Name and Tag are required.");
            return;
        }

        try {
            const data = await createTeam({
                name: formFullName,
                shortName: formShortName.toUpperCase(),
                logoUrl: formLogo || 'https://cdn-icons-png.flaticon.com/512/1694/1694460.png',
                country: user.country,
                district: user.district,
                captainId: user.id,
                leaderId: user.id,
                members: [user],
                rankPoints: 0
            });

            onUpdateUser({ ...user, teamId: data.id });
            setTeam(data);
            setIsCreating(false);
            setActiveTab('OVERVIEW');
            socketService.joinTeamRoom(data.id);
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to create squad');
        }
    };

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();

        if (auth.isGuest(user)) {
            alert("REGISTRATION REQUIRED: Chat is only available for registered operators.");
            return;
        }

        const text = editingMsgId ? editContent : chatInput;
        if (!text.trim() || !team) return;

        if (editingMsgId) {
            socketService.editMessage(editingMsgId, editContent, team.id || team._id);
            setEditingMsgId(null);
            setEditContent('');
        } else {
            const tempId = Date.now().toString();
            const msgBody = {
                teamId: team.id || team._id,
                senderId: user.id,
                senderName: user.ign,
                text: chatInput,
                tempId,
                repliedTo: replyingTo ? (replyingTo.id || replyingTo._id) : undefined,
                timestamp: new Date().toISOString(),
                status: 'sending'
            };

            // Optimistic UI update for the sender
            const optimisticMsg = {
                ...msgBody,
                repliedTo: replyingTo ? { senderName: replyingTo.senderName, text: replyingTo.text } : undefined
            };

            setChats(prev => [...prev, optimisticMsg]);
            setTimeout(scrollToBottom, 50);

            socketService.sendTeamMessage({
                teamId: team.id || team._id,
                senderId: user.id,
                senderName: user.ign,
                text: chatInput,
                tempId,
                repliedTo: replyingTo ? (replyingTo.id || replyingTo._id) : undefined
            });
            setChatInput('');
            setReplyingTo(null);
            socketService.stopTyping(team.id || team._id);
        }
    };

    const handleReply = (msg: any) => {
        setReplyingTo(msg);
        setEditingMsgId(null);
        // Focus chat input
        const input = document.querySelector('input[placeholder*="transmission"]') as HTMLInputElement;
        input?.focus();
    };

    const handleReact = (msgId: string, emoji: string) => {
        if (!team) return;
        socketService.socket?.emit('react-team-message', {
            messageId: msgId,
            teamId: team.id || team._id,
            senderName: user.ign,
            emoji
        });
    };

    const handleForward = (msg: any) => {
        // For now, prompt or show a list (Simplified: Copy to clipboard with forward metadata)
        const forwardText = `[FORWARDED FROM ${msg.senderName}]: ${msg.text}`;
        setChatInput(forwardText);
        alert('Neural Data captured for relay. Select destination or press send.');
    };

    const startEditing = (msg: any) => {
        setEditingMsgId(msg.id || msg._id);
        setEditContent(msg.text);
        setReplyingTo(null);
    };

    const handleDeleteMessage = (msgId: string) => {
        if (!team) return;
        if (confirm("Delete this transmission?")) {
            socketService.deleteMessage(msgId, team.id || team._id);
        }
    };

    const handleInviteUser = async () => {
        if (!inviteUid.trim() || !team) return;
        try {
            await socketService.inviteUser(team._id || team.id, inviteUid, inviteMsg);
            setInviteUid('');
            setInviteMsg('');
        } catch (error) { }
    };

    const handleUpdateLogo = async () => {
        if (!team || !logoPreview) return;
        try {
            // If it's a file blob, upload it
            let finalUrl = logoPreview;
            if (logoPreview.startsWith('blob:')) {
                // This implies we need the file object, but we only have preview.
                // Re-thinking: handleImageUpload should do the upload.
            }
            const updatedTeam = await socketService.updateTeam(team._id || team.id, { logoUrl: logoPreview });
            if (updatedTeam) {
                setTeam(updatedTeam);
                alert('Squad logo updated.');
                setLogoPreview('');
            }
        } catch (error) {
            console.error('Update logo failed', error);
        }
    };

    const handleUpdateBanner = async () => {
        if (!team || !bannerPreview) return;
        try {
            const updatedTeam = await socketService.updateTeam(team._id || team.id, { bannerUrl: bannerPreview });
            if (updatedTeam) {
                setTeam(updatedTeam);
                alert('Squad banner updated.');
                setBannerPreview('');
            }
        } catch (error) {
            console.error('Update banner failed', error);
        }
    };

    const handleTransferLeadership = async (memberId: string) => {
        if (!team) return;
        if (confirm("WARNING: Transferring leadership level clearance. Proceed?")) {
            try {
                await socketService.transferLeadership(team._id || team.id, memberId);
                alert('Command transferred successfully.');
                loadTeamData();
            } catch (error) { }
        }
    };

    const handleKickMember = async (memberId: string) => {
        if (!team) return;
        if (confirm("WARNING: Revoking operative status. Proceed?")) {
            await socketService.kickMember(team._id || team.id, memberId);
            loadTeamData();
        }
    };

    const handleDisbandTeam = async () => {
        if (!team) return;
        if (confirm("CRITICAL WARNING: This will permanently purge the squad and all operational history. Proceed?")) {
            try {
                const res = await deleteTeam(team._id || team.id);
                if (res) {
                    alert('SQUAD PURGED.');
                    onUpdateUser({ ...user, teamId: undefined });
                    setTeam(null);
                    onBack();
                }
            } catch (error: any) {
                alert(error.response?.data?.message || 'Authorization error during purge.');
            }
        }
    };

    const handleUpdateBasicInfo = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!team) return;
        try {
            const updatedTeam = await socketService.updateTeam(team._id || team.id, {
                name: team.name,
                shortName: team.shortName
            });
            if (updatedTeam) {
                setTeam(updatedTeam);
                alert('Squad records updated.');
            }
        } catch (error) {
            console.error('Update basic info failed', error);
        }
    };

    const isManager = team?.captainId === user.id;
    const isLeader = team?.leaderId === user.id;
    const canManage = isManager || isLeader;

    return (
        <PullToRefresh onRefresh={() => activeTab !== 'CHAT' ? loadTeamData(true) : Promise.resolve()} disabled={activeTab === 'CHAT'}>
            <div className="pb-28 pt-6 px-4 space-y-6 min-h-screen">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center space-x-2 cursor-pointer" onClick={onBack}>
                        <div className="p-1 bg-white/10 rounded clip-corner-sm hover:bg-white/20 transition-all"><X size={16} /></div>
                        <div>
                            <h2 className="text-xl font-black uppercase italic tracking-wider text-white leading-tight">Tactical <span className="text-gaming-accent">Squad</span></h2>
                            {activeTab === 'CHAT' && team && (
                                <p className="text-[8px] text-gaming-accent font-black uppercase tracking-widest animate-pulse">
                                    {onlineCount} Online / {team.members.length} Total
                                </p>
                            )}
                        </div>
                    </div>
                    {team && (
                        <div className="flex space-x-1">
                            <button onClick={() => setIsCalling(true)} className="p-2 mr-2 bg-gaming-accent/10 border border-gaming-accent/30 rounded-xl text-gaming-accent hover:bg-gaming-accent hover:text-black transition-all animate-pulse" title="Comm Link"><Mic size={16} /></button>
                            <button onClick={() => setActiveTab('OVERVIEW')} className={`p-2 rounded transition-all ${activeTab === 'OVERVIEW' ? 'bg-gaming-accent text-black shadow-[0_0_10px_rgba(0,223,130,0.3)]' : 'text-gray-500'}`}><Shield size={16} /></button>
                            <button onClick={() => setActiveTab('CHAT')} className={`p-2 rounded transition-all ${activeTab === 'CHAT' ? 'bg-gaming-accent text-black shadow-[0_0_10px_rgba(0,223,130,0.3)]' : 'text-gray-500'}`}><MessageSquare size={16} /></button>
                            {canManage && <button onClick={() => setActiveTab('SETTINGS')} className={`p-2 rounded transition-all ${activeTab === 'SETTINGS' ? 'bg-gaming-accent text-black shadow-[0_0_10px_rgba(0,223,130,0.3)]' : 'text-gray-500'}`}><SettingsIcon size={16} /></button>}
                        </div>
                    )}
                </div>

                {isCalling && team && (
                    <TeamCallOverlay
                        teamId={team._id || team.id}
                        teamName={team.name}
                        onClose={() => setIsCalling(false)}
                    />
                )}

                {isLoading ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-20 gap-4">
                        <div className="w-12 h-12 border-2 border-gaming-accent border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Verifying Neural Link...</p>
                    </div>
                ) : !team ? (
                    !isCreating ? (
                        <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-6 overflow-y-auto">
                            {myInvites.length > 0 && (
                                <div className="w-full max-w-sm mb-8 space-y-2">
                                    <h3 className="text-gaming-accent text-xs font-bold uppercase tracking-widest mb-2 flex items-center"><MessageSquare size={14} className="mr-2" /> Incoming Transmissions</h3>
                                    {myInvites.map(inv => (
                                        <div key={inv.id || inv._id} className="bg-[#1a1a24] border border-gaming-accent/30 p-4 clip-corner-sm flex flex-col space-y-3 group hover:bg-[#252532] transition-colors relative">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 bg-black border border-white/10 p-1 clip-corner-sm">
                                                    <img src={inv.teamLogo || 'https://cdn-icons-png.flaticon.com/512/1694/1694460.png'} className="w-full h-full object-contain" />
                                                </div>
                                                <div>
                                                    <p className="text-white font-bold uppercase text-sm">{inv.teamName}</p>
                                                    <p className="text-[10px] text-gray-500">From Command: {inv.senderId}</p>
                                                </div>
                                            </div>
                                            {inv.message && (
                                                <div className="bg-black/30 p-2 text-[10px] text-gray-400 italic font-mono border-l-2 border-gaming-accent">"{inv.message}"</div>
                                            )}
                                            <div className="flex space-x-2">
                                                <button onClick={() => handleAcceptInvite(inv.id || inv._id)} className="flex-1 bg-gaming-accent text-black p-2 clip-corner-sm hover:bg-white transition-colors font-bold text-xs uppercase">Accept</button>
                                                <button onClick={() => handleRejectInvite(inv.id || inv._id)} className="flex-1 bg-red-500/20 text-red-500 border border-red-500/50 p-2 clip-corner-sm hover:bg-red-500 hover:text-white transition-colors font-bold text-xs uppercase">Decline</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="bg-[#0c0c12]/80 backdrop-blur-md border border-white/5 clip-corner-sm p-8 text-center w-full max-w-sm hover:border-gaming-accent/50 transition-colors group cyber-glimmer">
                                <Shield size={64} className="mx-auto text-gray-700 mb-6 group-hover:text-gaming-accent transition-colors" />
                                <h3 className="text-gray-300 font-bold uppercase tracking-wider mb-2 text-lg">No Active Unit</h3>
                                <p className="text-gray-500 text-xs mb-6 max-w-[200px] mx-auto">Create your own tactical squad or wait for an invitation from an existing commander.</p>
                                <button onClick={() => setIsCreating(true)} className="bg-gaming-accent text-black px-8 py-3 clip-corner-sm font-black uppercase tracking-[0.2em] text-xs hover:bg-white transition-colors">Initialize New Squad</button>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-[#0c0c12]/90 backdrop-blur-md border border-gaming-accent/30 clip-corner-sm p-5 flex-1 overflow-y-auto">
                            <form onSubmit={handleCreateTeam} className="space-y-5">
                                <h3 className="text-gaming-accent font-bold uppercase">Unit Registration</h3>
                                <input required value={formFullName} onChange={e => setFormFullName(e.target.value)} className="w-full bg-black border border-white/20 p-3 text-white text-sm clip-corner-sm" placeholder="Squad Name (e.g. PHANTOM)" />
                                <input required maxLength={6} value={formShortName} onChange={e => setFormShortName(e.target.value)} className="w-full bg-black border border-white/20 p-3 text-white text-sm clip-corner-sm" placeholder="Tag (e.g. PTM)" />
                                <label className="block text-gray-400 text-[10px] uppercase font-bold tracking-widest mt-4">Squad Logo</label>
                                <div className="flex items-center space-x-4 p-4 bg-black/50 border border-white/5 clip-corner-sm">
                                    <div className="w-12 h-12 bg-black border border-white/10 flex items-center justify-center overflow-hidden clip-corner-sm flex-shrink-0">
                                        {formLogo ? <img src={formLogo} className="w-full h-full object-contain" /> : <ImageIcon size={20} className="text-gray-700" />}
                                    </div>
                                    <input type="file" accept="image/*" onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            try {
                                                const uploaded = await chatApi.uploadFile(file);
                                                setFormLogo(uploaded.url);
                                            } catch (err) {
                                                console.error("Team logo upload failed", err);
                                            }
                                        }
                                    }} className="text-[10px] text-gray-500 file:bg-gaming-accent/10 file:text-gaming-accent file:border-gaming-accent/20 file:px-3 file:py-1 file:rounded file:mr-2 file:uppercase file:font-black file:tracking-widest" />
                                </div>
                                <button className="w-full bg-gaming-accent text-black font-black py-4 clip-corner-sm uppercase tracking-[0.2em] text-xs mt-4 shadow-[0_0_20px_rgba(0,223,130,0.3)]">Establish Squad</button>
                                <button onClick={() => setIsCreating(false)} type="button" className="w-full text-gray-500 py-2 text-xs uppercase font-bold tracking-widest">Abort Procedure</button>
                            </form>
                        </div>
                    )
                ) : (
                    activeTab === 'OVERVIEW' ? (
                        <div className="flex-1 overflow-y-auto space-y-6 scrollbar-hide pb-10">
                            <div className="relative border border-gaming-accent/20 clip-corner-sm overflow-hidden min-h-[220px] flex items-end p-6 bg-[#0c0c12] group shadow-[0_0_30px_rgba(0,223,130,0.1)] cyber-glimmer">
                                <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c12] via-[#0c0c12]/40 to-transparent z-10"></div>
                                {(team.bannerUrl || bannerPreview) ? (
                                    <img src={team.bannerUrl || bannerPreview} className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:scale-105 transition-transform duration-700" />
                                ) : (
                                    <div className="absolute inset-0 bg-[#0c0c12] opacity-40">
                                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                                    </div>
                                )}

                                <div className="relative z-20 w-full flex items-end justify-between">
                                    <div className="flex items-end space-x-6">
                                        <div className="w-28 h-28 bg-black border-2 border-gaming-accent/30 clip-corner-sm p-1 shadow-2xl relative group-hover:border-gaming-accent transition-colors">
                                            <div className="absolute inset-0 bg-gradient-to-tr from-gaming-accent/20 to-transparent"></div>
                                            <img src={team.logoUrl} className="w-full h-full object-contain relative z-10 p-2" />
                                        </div>
                                        <div className="mb-1">
                                            <h1 className="text-4xl font-black uppercase italic text-white leading-none tracking-tighter drop-shadow-[0_0_10px_rgba(0,0,0,0.8)]">{team.name}</h1>
                                            <div className="flex items-center space-x-2 mt-2">
                                                <span className="bg-gaming-accent text-black text-[10px] font-black px-2 py-0.5 clip-corner-sm">{team.shortName}</span>
                                                <span className="text-gray-500 text-[10px] font-mono tracking-[0.3em] uppercase">REGION: {team.district || 'GLOBAL'}</span>
                                            </div>
                                            <div className="mt-2 flex items-center space-x-2">
                                                <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest leading-none">ID:</span>
                                                <button onClick={() => { const id = team._id || team.id; navigator.clipboard.writeText(id); setCopiedId(true); setTimeout(() => setCopiedId(false), 2000); }} className="text-[10px] text-gaming-accent font-mono hover:text-white transition-colors flex items-center gap-1 group/id">
                                                    {team._id || team.id}
                                                    {copiedId ? <Check size={8} className="text-green-500" /> : <Copy size={8} className="opacity-50 group-hover/id:opacity-100" />}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                <div className="bg-[#12121a] border border-white/5 p-4 clip-corner-sm hover:border-gaming-accent/30 transition-colors group cyber-glimmer">
                                    <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest mb-1 group-hover:text-gaming-accent/60 transition-colors">Battles</p>
                                    <p className="text-2xl font-black text-white font-mono">{team.stats?.matches || 0}</p>
                                </div>
                                <div className="bg-[#12121a] border border-white/5 p-4 clip-corner-sm hover:border-gaming-accent/30 transition-colors group cyber-glimmer">
                                    <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest mb-1 group-hover:text-gaming-accent/60 transition-colors">Victories</p>
                                    <p className="text-2xl font-black text-gaming-accent font-mono drop-shadow-[0_0_8px_rgba(0,223,130,0.3)]">{team.stats?.wins || 0}</p>
                                </div>
                                <div className="bg-[#12121a] border border-white/5 p-4 clip-corner-sm hover:border-gaming-accent/30 transition-colors group cyber-glimmer">
                                    <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest mb-1 group-hover:text-gaming-accent/60 transition-colors">Elims</p>
                                    <p className="text-2xl font-black text-red-500 font-mono">{team.stats?.totalKills || 0}</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h4 className="text-xs text-gray-400 uppercase font-bold tracking-widest flex items-center px-1"><Users size={14} className="mr-2 text-gaming-accent" /> Active Roster ({team.members.length}/10)</h4>
                                {team.members.map(member => (
                                    <div key={member.id} className="bg-[#15151e] p-3 clip-corner-sm border border-white/5 flex justify-between items-center group hover:bg-[#1a1a24] transition-colors relative overflow-hidden">
                                        <div className="flex items-center space-x-4">
                                            <div className="relative">
                                                <img src={member.avatarUrl || `https://ui-avatars.com/api/?name=${member.ign}&background=0c0c12&color=fff`} className="w-10 h-10 clip-corner-sm border border-gaming-accent/30" />
                                                <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-[#15151e] ${onlineUserIds.has(member.id) ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-gray-700'}`}></div>
                                                {member.id === team.captainId && <div className="absolute -bottom-1 -right-1 bg-black rounded-full p-0.5"><Crown size={10} className="text-gaming-accent" /></div>}
                                                {member.id === team.leaderId && <div className="absolute -bottom-1 -right-1 bg-black rounded-full p-0.5"><Shield size={10} className="text-blue-500" /></div>}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-white uppercase flex items-center tracking-wide group-hover:text-gaming-accent transition-colors">{member.ign}</p>
                                                <p className="text-[9px] text-gray-500 uppercase font-mono tracking-wider">{member.role} // <span className="text-gaming-accent/50">{member.id}</span></p>
                                            </div>
                                        </div>
                                        {member.id === user.id && <div className="px-2 py-0.5 bg-gaming-accent/10 text-gaming-accent text-[9px] font-bold uppercase clip-corner-sm border border-gaming-accent/20">YOU</div>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : activeTab === 'SETTINGS' ? (
                        <div className="flex-1 overflow-y-auto space-y-6 pb-20">
                            <div className="bg-[#12121a] p-6 clip-corner-sm border border-gaming-accent/20 cyber-glimmer">
                                <h4 className="text-xs text-gaming-accent uppercase font-black tracking-widest mb-6 flex items-center"><SettingsIcon size={14} className="mr-2" /> Squad Config</h4>

                                <form onSubmit={handleUpdateBasicInfo} className="space-y-4 mb-8">
                                    <div>
                                        <label className="text-[9px] text-gray-400 uppercase font-bold tracking-widest mb-1 block">Squad Designation (Name)</label>
                                        <input
                                            value={team.name}
                                            onChange={e => setTeam({ ...team, name: e.target.value })}
                                            className="w-full bg-black border border-white/10 p-3 text-white text-xs clip-corner-sm focus:border-gaming-accent/50 selection:bg-gaming-accent/30"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[9px] text-gray-400 uppercase font-bold tracking-widest mb-1 block">Tactical Tag</label>
                                        <input
                                            maxLength={6}
                                            value={team.shortName}
                                            onChange={e => setTeam({ ...team, shortName: e.target.value.toUpperCase() })}
                                            className="w-full bg-black border border-white/10 p-3 text-white text-xs clip-corner-sm focus:border-gaming-accent/50"
                                        />
                                    </div>
                                    <button type="submit" className="w-full bg-gaming-accent/10 text-gaming-accent border border-gaming-accent/30 py-2 clip-corner-sm text-[10px] font-black uppercase tracking-widest hover:bg-gaming-accent hover:text-black transition-all flex items-center justify-center gap-2">
                                        <Save size={12} /> Sync Basic Data
                                    </button>
                                </form>

                                <div className="mb-6 grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[9px] text-gray-400 uppercase font-bold tracking-widest mb-2 block text-center">Identity Logo</label>
                                        <div className="border border-white/10 p-2 text-center clip-corner-sm hover:bg-white/5 transition-colors cursor-pointer relative aspect-square flex flex-col items-center justify-center">
                                            <input type="file" accept="image/*" onChange={async (e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    try {
                                                        const uploaded = await chatApi.uploadFile(file);
                                                        setLogoPreview(uploaded.url);
                                                    } catch (err) {
                                                        console.error("Logo upload failed", err);
                                                    }
                                                }
                                            }} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                                            <img src={logoPreview || team.logoUrl} className="w-12 h-12 object-contain mb-2" />
                                            <p className="text-[8px] text-gaming-accent font-black uppercase">{logoPreview ? 'Select New' : 'Change Logo'}</p>
                                        </div>
                                        {logoPreview && (
                                            <button onClick={handleUpdateLogo} className="mt-2 w-full bg-gaming-accent text-black text-[8px] font-black p-1.5 uppercase clip-corner-sm flex items-center justify-center gap-1">
                                                <Save size={10} /> Save Logo
                                            </button>
                                        )}
                                    </div>
                                    <div>
                                        <label className="text-[9px] text-gray-400 uppercase font-bold tracking-widest mb-2 block text-center">Squad Banner</label>
                                        <div className="border border-white/10 p-2 text-center clip-corner-sm hover:bg-white/5 transition-colors cursor-pointer relative aspect-square flex flex-col items-center justify-center">
                                            <input type="file" accept="image/*" onChange={async (e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    try {
                                                        const uploaded = await chatApi.uploadFile(file);
                                                        setBannerPreview(uploaded.url);
                                                    } catch (err) {
                                                        console.error("Banner upload failed", err);
                                                    }
                                                }
                                            }} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                                            {(bannerPreview || team.bannerUrl) ? (
                                                <img src={bannerPreview || team.bannerUrl} className="w-full h-full object-cover opacity-50 clip-corner-sm" />
                                            ) : (
                                                <ImageIcon size={24} className="mx-auto text-gray-500 mb-2 opacity-30" />
                                            )}
                                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40">
                                                <p className="text-[8px] text-gaming-accent font-black uppercase font-mono">{bannerPreview ? 'Asset Ready' : 'Update Cover'}</p>
                                            </div>
                                        </div>
                                        {bannerPreview && (
                                            <button onClick={handleUpdateBanner} className="mt-2 w-full bg-gaming-accent text-black text-[8px] font-black p-1.5 uppercase clip-corner-sm flex items-center justify-center gap-1">
                                                <Save size={10} /> Save Banner
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <div className="mb-6">
                                    <label className="text-[9px] text-gray-400 uppercase font-bold tracking-widest mb-2 block">Recruitment</label>
                                    <div className="space-y-2">
                                        <div className="flex space-x-2">
                                            <input value={inviteUid} onChange={e => setInviteUid(e.target.value)} placeholder="Player ID..." className="flex-1 bg-black border border-white/10 p-3 text-white text-xs clip-corner-sm" />
                                            <button onClick={handleInviteUser} className="bg-gaming-accent text-black px-4 font-black text-xs clip-corner-sm uppercase"><UserPlus size={16} /></button>
                                        </div>
                                        <input value={inviteMsg} onChange={e => setInviteMsg(e.target.value)} placeholder="Mission Briefing..." className="w-full bg-black/50 border border-white/5 p-2 text-gray-500 text-[10px] clip-corner-sm focus:border-gaming-accent/30" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-[#12121a] p-6 clip-corner-sm border border-white/5">
                                <h4 className="text-xs text-red-500 uppercase font-black tracking-widest mb-6 flex items-center"><AlertTriangle size={14} className="mr-2" /> Danger Zone</h4>
                                <div className="space-y-3">
                                    {team.members.map(member => member.id !== user.id && (
                                        <div key={member.id} className="flex items-center justify-between bg-black/40 p-3 clip-corner-sm">
                                            <span className="text-xs text-gray-300 font-bold">{member.ign}</span>
                                            <div className="flex space-x-1">
                                                <button onClick={() => handleTransferLeadership(member.id)} className="p-2 bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white rounded transition-colors" title="Transfer Command"><ArrowRightLeft size={14} /></button>
                                                <button onClick={() => handleKickMember(member.id)} className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded transition-colors" title="Expel"><Trash2 size={14} /></button>
                                            </div>
                                        </div>
                                    ))}
                                    {isManager && (
                                        <button onClick={handleDisbandTeam} className="w-full mt-6 bg-red-600/10 hover:bg-red-600 text-red-600 hover:text-white border border-red-600/30 py-4 clip-corner-sm text-[10px] font-black uppercase tracking-[0.25em] transition-all">Disband Neural Squad</button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col bg-[#0c0c12]/60 backdrop-blur-md border border-white/5 clip-corner-sm overflow-hidden h-full relative">
                            <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24 scrollbar-hide">
                                {chats.map((msg, idx) => (
                                    <div key={idx} className={`flex flex-col ${msg.senderId === user.id ? 'items-end' : 'items-start'} group animate-fade-in`}>
                                        <div className="flex items-center space-x-2 mb-0.5 px-1">
                                            <span className={`text-[8px] font-bold uppercase tracking-widest ${msg.senderId === user.id ? 'text-gaming-accent' : 'text-gray-500'}`}>{msg.senderName}</span>
                                            <span className="text-[7px] text-white/20 font-mono">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            {msg.isForwarded && <span className="text-[7px] text-blue-400 font-black uppercase tracking-widest bg-blue-400/10 px-1 rounded-sm flex items-center gap-0.5"><ArrowRightLeft size={8} /> Neural Relay</span>}
                                        </div>

                                        <div className="relative flex items-end group gap-2">
                                            {msg.senderId !== user.id && (
                                                <div className="hidden group-hover:flex items-center space-x-1 animate-fade-in order-last">
                                                    <button onClick={() => handleReply(msg)} className="p-1.5 hover:text-gaming-accent text-white/20 transition-colors" title="Reply"><MessageSquare size={12} /></button>
                                                    <button onClick={() => handleReact(msg.id || msg._id, '👍')} className="p-1.5 hover:text-gaming-accent text-white/20 transition-colors">👍</button>
                                                    <button onClick={() => handleForward(msg)} className="p-1.5 hover:text-blue-400 text-white/20 transition-colors" title="Forward"><ArrowRightLeft size={12} /></button>
                                                </div>
                                            )}

                                            <div className={`max-w-[85%] flex flex-col ${msg.senderId === user.id ? 'items-end' : 'items-start'}`}>
                                                {/* Reply Preview */}
                                                {msg.repliedTo && (
                                                    <div className={`mb-1 px-3 py-1.5 bg-white/5 border-l-2 border-gaming-accent/50 text-[10px] italic text-gray-400 clip-corner-sm truncate max-w-full ${msg.senderId === user.id ? 'self-end' : 'self-start'}`}>
                                                        <span className="text-gaming-accent font-bold not-italic mr-1 uppercase">{msg.repliedTo.senderName}:</span>
                                                        {msg.repliedTo.text}
                                                    </div>
                                                )}

                                                <div className={`px-3 py-2 rounded-xl text-xs font-mono break-words relative shadow-2xl ${msg.senderId === user.id ? 'bg-gaming-accent/10 text-white rounded-tr-none border border-gaming-accent/20' : 'bg-[#12121a] text-gray-300 rounded-tl-none border border-white/10'}`}>
                                                    {msg.text}
                                                    {msg.isEdited && <span className="text-[7px] text-gray-600 ml-1 uppercase">(Re-encrypted)</span>}
                                                    {msg.status === 'sending' && <span className="text-[7px] text-gaming-accent/50 ml-1 italic animate-pulse">(Encrypting...)</span>}

                                                    {/* Reactions */}
                                                    {msg.reactions && msg.reactions.length > 0 && (
                                                        <div className={`absolute -bottom-2 ${msg.senderId === user.id ? 'right-0' : 'left-0'} flex gap-1`}>
                                                            {Array.from(new Set(msg.reactions.map((r: any) => r.emoji))).map((emoji: any) => (
                                                                <button
                                                                    key={emoji}
                                                                    onClick={() => handleReact(msg.id || msg._id, emoji)}
                                                                    className="bg-black border border-white/10 rounded-full px-1.5 py-0.5 text-[8px] flex items-center gap-1 hover:border-gaming-accent transition-colors"
                                                                >
                                                                    <span>{emoji}</span>
                                                                    <span className="text-gray-500">{msg.reactions.filter((r: any) => r.emoji === emoji).length}</span>
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {msg.senderId === user.id && (
                                                <div className="hidden group-hover:flex items-center space-x-1 animate-fade-in order-first">
                                                    <button onClick={() => handleReply(msg)} className="p-1.5 hover:text-gaming-accent text-white/20 transition-colors" title="Reply"><MessageSquare size={12} /></button>
                                                    <button onClick={() => startEditing(msg)} className="p-1.5 hover:text-gaming-accent text-white/20 transition-colors" title="Edit"><SettingsIcon size={12} /></button>
                                                    <button onClick={() => handleDeleteMessage(msg.id || msg._id)} className="p-1.5 hover:text-red-500 text-white/20 transition-colors" title="Delete"><Trash2 size={12} /></button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                <div ref={chatEndRef} />
                            </div>

                            <div className="absolute bottom-2 left-2 right-2 flex flex-col pointer-events-none">
                                {typingUsers.size > 0 && (
                                    <div className="px-4 py-1 text-[8px] text-gaming-accent/70 font-bold uppercase tracking-[0.2em] animate-pulse">
                                        {Array.from(typingUsers).join(', ')} {typingUsers.size === 1 ? 'is' : 'are'} decrypting data...
                                    </div>
                                )}

                                {replyingTo && (
                                    <div className="bg-[#1a1a24] px-4 py-2 flex justify-between items-start border-t border-gaming-accent/30 clip-corner-sm backdrop-blur-md mb-1 pointer-events-auto shadow-2xl relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-gaming-accent"></div>
                                        <div className="flex-1 min-w-0 pr-4">
                                            <p className="text-[8px] text-gaming-accent font-black uppercase tracking-widest mb-0.5">Replying to {replyingTo.senderName}</p>
                                            <p className="text-[10px] text-gray-400 truncate">{replyingTo.text}</p>
                                        </div>
                                        <button onClick={() => setReplyingTo(null)} className="p-1 hover:text-white text-gray-600 transition-colors"><X size={12} /></button>
                                    </div>
                                )}

                                {editingMsgId && (
                                    <div className="bg-gaming-accent/10 px-4 py-1 flex justify-between items-center text-[10px] text-gaming-accent border border-gaming-accent/20 clip-corner-sm backdrop-blur-md mb-1 pointer-events-auto">
                                        <span className="font-bold tracking-widest uppercase italic">Updating Data Transmission...</span>
                                        <button onClick={() => { setEditingMsgId(null); setChatInput(''); setEditContent(''); }}><X size={10} /></button>
                                    </div>
                                )}
                                <form onSubmit={handleSendMessage} className="bg-black/80 backdrop-blur-md border border-white/10 p-2 clip-corner-sm flex items-center space-x-2 shadow-[0_0_15px_rgba(0,0,0,0.5)] pointer-events-auto">
                                    <input value={editingMsgId ? editContent : chatInput} onChange={e => {
                                        if (editingMsgId) setEditContent(e.target.value);
                                        else {
                                            setChatInput(e.target.value);
                                            if (team) socketService.typing(team.id || team._id, user.ign);
                                        }
                                    }} className="flex-1 bg-black/50 border border-white/5 text-white text-[11px] p-3 clip-corner-sm focus:outline-none focus:border-gaming-accent/50 transition-colors font-mono" placeholder={editingMsgId ? "Rewrite data..." : "Type transmission..."} />
                                    <button type="submit" className="w-10 h-10 bg-gaming-accent text-black clip-corner-sm flex items-center justify-center hover:bg-white transition-all shadow-[0_0_15px_rgba(0,223,130,0.2)]"><Send size={16} /></button>
                                </form>
                            </div>
                        </div>
                    )
                )}
            </div>
        </PullToRefresh>
    );
};

export default TeamManager;
