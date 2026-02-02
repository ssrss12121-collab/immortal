import React, { useState, useRef, useEffect } from 'react';
import { UserProfile, Team } from '../types';
import { chatApi } from '../utils/chat';
import { BADGE_COLORS } from '../constants';
import {
    Wallet, TrendingUp, Skull, Crosshair, Award, Settings as SettingsIcon,
    LogOut, Shield, ChevronRight, Copy, Check, Camera, Edit2, Save, X,
    Upload, CreditCard, Zap, Calendar, Crown, AlertTriangle, Users, User as UserIcon
} from 'lucide-react';

import MatchHistory from '@/components/MatchHistory';
import MembershipModal from '@/components/MembershipModal';
import PullToRefresh from '@/components/PullToRefresh';

interface ProfileProps {
    user: UserProfile;
    onLogout: () => void;
    onNavigateToTeam: () => void;
    onNavigateToSettings: () => void;
    onUpdateUser: (user: UserProfile) => void;
    onRefresh?: () => Promise<void>;
}

const Profile: React.FC<ProfileProps> = ({ user: initialUser, onLogout, onNavigateToTeam, onNavigateToSettings, onUpdateUser, onRefresh }) => {
    const [user, setUser] = useState(initialUser); // Local state for immediate updates
    const [copied, setCopied] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [showMembershipModal, setShowMembershipModal] = useState(false);

    // Sync with prop updates
    useEffect(() => {
        setUser(initialUser);
    }, [initialUser]);

    // Profile Editing State
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        avatarUrl: user.avatarUrl || `https://ui-avatars.com/api/?name=${initialUser.name}&background=000&color=fff`,
        ign: initialUser.ign
    });

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSaveProfile = () => {
        const updatedUser = { ...user, ign: editForm.ign, avatarUrl: editForm.avatarUrl };
        setUser(updatedUser);
        onUpdateUser(updatedUser);
        setIsEditing(false);
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                // Show local preview immediately
                const localUrl = URL.createObjectURL(file);
                setEditForm(prev => ({ ...prev, avatarUrl: localUrl }));

                // Upload to R2
                const uploaded = await chatApi.uploadFile(file);
                setEditForm(prev => ({ ...prev, avatarUrl: uploaded.url }));
            } catch (err) {
                console.error("Avatar upload failed", err);
            }
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    return (
        <PullToRefresh onRefresh={onRefresh || (async () => { })}>
            <div className="pb-28 pt-6 px-4 space-y-6 min-h-screen">

                {/* Hidden File Input */}
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                />
                {user.role === 'Guest' && (
                    <div className="bg-orange-500/10 border border-orange-500/30 p-4 clip-corner-sm flex items-center justify-between group animate-pulse">
                        <div className="flex items-center space-x-3">
                            <AlertTriangle className="text-orange-500" size={18} />
                            <div>
                                <p className="text-xs font-bold text-white uppercase tracking-wider">Unregistered Account</p>
                                <p className="text-[9px] text-gray-500 font-mono uppercase">Full Access Restricted</p>
                            </div>
                        </div>
                        <button
                            onClick={onLogout}
                            className="px-4 py-2 bg-orange-500 text-black text-[10px] font-black uppercase tracking-widest clip-corner-sm hover:scale-105 transition-transform"
                        >
                            Register Now
                        </button>
                    </div>
                )}

                {/* Player Card */}
                <div className="bg-[#0c0c12]/90 backdrop-blur-md clip-corner border border-white/10 relative overflow-hidden group cyber-border-green cyber-glimmer">
                    {/* Background Art */}
                    <div className="absolute inset-0 bg-gradient-to-br from-gaming-accent/10 via-transparent to-transparent z-0"></div>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gaming-accent/5 blur-[50px] rounded-full"></div>

                    {/* ID Card Header Decoration */}
                    <div className="absolute top-4 right-4 flex space-x-1 z-20">
                        {isEditing ? (
                            <div className="flex space-x-2">
                                <button onClick={() => setIsEditing(false)} className="p-1.5 bg-red-500/20 text-red-500 rounded hover:bg-red-500 hover:text-white transition-colors"><X size={16} /></button>
                                <button onClick={handleSaveProfile} className="p-1.5 bg-green-500/20 text-green-500 rounded hover:bg-green-500 hover:text-white transition-colors"><Save size={16} /></button>
                            </div>
                        ) : (
                            <button onClick={() => setIsEditing(true)} className="p-1.5 bg-white/5 text-gray-400 rounded hover:bg-white/20 hover:text-white transition-colors">
                                <Edit2 size={14} />
                            </button>
                        )}
                        <div className="w-px h-6 bg-white/10 mx-2"></div>
                        <button onClick={onLogout} className="text-gray-600 hover:text-red-500 transition-colors p-1.5 border border-transparent hover:border-red-500/20 rounded">
                            <LogOut size={16} />
                        </button>
                    </div>

                    <div className="relative z-10 p-6">
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center space-x-5">
                                {/* Avatar Frame */}
                                <div className="w-20 h-20 relative group/avatar">
                                    <div className="absolute inset-0 bg-gradient-to-br from-gaming-accent/30 to-gaming-accent/10 clip-corner-sm shadow-[0_0_15px_rgba(0,223,130,0.2)] p-0.5">
                                        <img
                                            src={isEditing ? editForm.avatarUrl : (user.avatarUrl || `https://ui-avatars.com/api/?name=${user.name}&background=000&color=fff`)}
                                            alt="Profile"
                                            className="w-full h-full clip-corner-sm object-cover filter transition-all duration-500 group-hover/avatar:brightness-110"
                                        />
                                    </div>
                                    {isEditing && (
                                        <div
                                            onClick={triggerFileInput}
                                            className="absolute inset-0 flex items-center justify-center bg-black/60 clip-corner-sm cursor-pointer border border-dashed border-white/50 hover:bg-black/40 transition-colors"
                                        >
                                            <Camera size={20} className="text-white" />
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1">
                                    {isEditing ? (
                                        <div className="space-y-2">
                                            <div>
                                                <label className="text-[8px] text-gray-500 uppercase font-black tracking-[0.2em] block mb-1.5 opacity-70">Identity Matrix</label>
                                                <input
                                                    type="text"
                                                    value={editForm.ign}
                                                    onChange={(e) => setEditForm({ ...editForm, ign: e.target.value })}
                                                    className="bg-black/80 border border-white/20 text-white text-lg font-black px-4 py-3 w-full clip-corner-sm focus:border-gaming-accent focus:outline-none transition-all placeholder-gray-700"
                                                    placeholder="ENTER CODENAME"
                                                />
                                            </div>
                                            <div className="pt-2">
                                                <button
                                                    onClick={triggerFileInput}
                                                    className="flex items-center justify-center space-x-2 w-full p-4 bg-gaming-accent/10 border border-gaming-accent/30 rounded-lg text-[10px] text-gaming-accent hover:bg-gaming-accent/20 active:scale-95 transition-all uppercase font-black tracking-widest"
                                                >
                                                    <Camera size={16} />
                                                    <span>Change Avatar Data</span>
                                                </button>
                                                <p className="text-[8px] text-gray-600 mt-2 text-center uppercase tracking-tighter">Tap to upload • Press SAVE above to finalize</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="flex items-center space-x-2">
                                                <h2 className="text-2xl font-black uppercase italic tracking-wider text-white glitch-text" data-text={user.ign}>{user.ign}</h2>
                                                <Shield size={14} className="text-gaming-accent" />
                                            </div>
                                            {/* UID Section */}
                                            {/* UID Section */}
                                            <button
                                                onClick={() => copyToClipboard(user.playerId || user.id)}
                                                className="flex items-center space-x-2 my-1 group/uid hover:bg-gaming-accent/5 px-2 py-0.5 -ml-2 rounded transition-all"
                                            >
                                                <span className="text-[10px] font-mono text-gray-500 select-none">ID:</span>
                                                <span className="text-[10px] font-mono font-bold text-gaming-accent/80 tracking-widest">
                                                    {user.playerId || user.id} {user.role === 'Guest' && '(GUEST)'}
                                                </span>
                                                {copied ? <Check size={10} className="text-green-500" /> : <Copy size={10} className="text-gray-600 group-hover/uid:text-gaming-accent" />}
                                            </button>
                                            <div className="flex items-center gap-3 mt-1.5">
                                                <div className="flex items-center gap-1.5 bg-white/5 px-2 py-0.5 rounded border border-white/5">
                                                    <Users size={10} className="text-gaming-accent" />
                                                    <span className="text-[10px] font-black text-white">{user.followersCount || 0}</span>
                                                    <span className="text-[7px] text-gray-500 uppercase font-bold tracking-widest">Followers</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 bg-white/5 px-2 py-0.5 rounded border border-white/5">
                                                    <UserIcon size={10} className="text-gray-400" />
                                                    <span className="text-[10px] font-black text-white">{user.followingCount || 0}</span>
                                                    <span className="text-[7px] text-gray-500 uppercase font-bold tracking-widest">Following</span>
                                                </div>
                                            </div>
                                            <div className="cyber-tag-green px-2 py-0.5 w-fit mt-3 flex items-center gap-1">
                                                <span className="text-[9px] uppercase font-bold tracking-widest">
                                                    ● {user.stats?.badge || 'Bronze'} Tier
                                                </span>
                                                {user.membership?.expiresAt && new Date(user.membership.expiresAt) > new Date() && (
                                                    <span className="ml-2 px-1.5 py-0.5 bg-gaming-accent text-black text-[7px] font-black uppercase rounded-sm flex items-center gap-0.5">
                                                        <Crown size={8} />
                                                        Premium Operator
                                                    </span>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Attributes */}
                        <div className="grid grid-cols-3 gap-px bg-white/10 border border-white/10 clip-corner-sm mb-6">
                            <div className="bg-[#12121a]/90 p-2.5">
                                <p className="text-[8px] text-gray-500 uppercase font-bold tracking-widest mb-0.5">Role</p>
                                <p className="text-xs font-bold text-white uppercase tracking-wider">{user.role}</p>
                            </div>
                            <div className="bg-[#12121a]/90 p-2.5">
                                <p className="text-[8px] text-gray-500 uppercase font-bold tracking-widest mb-0.5">Country</p>
                                <p className="text-xs font-bold text-white uppercase tracking-wider">{user.country || 'Bangladesh'}</p>
                            </div>
                            <div className="bg-[#12121a]/90 p-2.5">
                                <p className="text-[8px] text-gray-500 uppercase font-bold tracking-widest mb-0.5">District</p>
                                <p className="text-xs font-bold text-white uppercase tracking-wider">{user.district || 'Global'}</p>
                            </div>
                        </div>

                        {/* Membership Status */}
                        <div className="bg-gradient-to-r from-[#1a1a24] to-[#0c0c12] border border-white/5 p-4 clip-corner-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-16 h-full bg-gradient-to-l from-gaming-accent/5 to-transparent skew-x-12"></div>

                            <div className="flex justify-between items-center mb-4 relative z-10">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <Zap className="text-gaming-accent" size={12} />
                                        <p className="text-gray-500 text-[9px] uppercase font-bold tracking-[0.2em]">Service Level</p>
                                    </div>
                                    <h3 className={`text-2xl font-mono font-bold uppercase ${user.membership?.expiresAt && new Date(user.membership.expiresAt) > new Date() ? 'text-gaming-accent drop-shadow-[0_0_8px_rgba(0,223,130,0.3)]' : 'text-red-500'}`}>
                                        {user.membership?.expiresAt && new Date(user.membership.expiresAt) > new Date() ? 'ACTIVE' : 'BASIC'}
                                    </h3>
                                    {user.membership?.expiresAt && (
                                        <div className="flex items-center gap-1.5 mt-1 text-gray-500">
                                            <Calendar size={10} />
                                            <span className="text-[9px] font-mono">EXPIRES: {new Date(user.membership.expiresAt).toLocaleDateString()}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="p-2 bg-white/5 rounded-full border border-white/5">
                                    <Shield className={user.membership?.expiresAt && new Date(user.membership.expiresAt) > new Date() ? 'text-gaming-accent' : 'text-gray-600'} size={20} />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 gap-3 relative z-10">
                                {user.membership?.expiresAt && new Date(user.membership.expiresAt) > new Date() ? (
                                    <div className="text-center py-2 border border-gaming-accent/30 bg-gaming-accent/5 clip-corner-sm">
                                        <span className="text-[9px] text-gaming-accent font-black uppercase tracking-widest">Operator Clearance Confirmed</span>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setShowMembershipModal(true)}
                                        className="bg-white text-black font-bold py-2.5 clip-corner-sm text-[10px] uppercase tracking-widest hover:bg-gaming-accent transition-all shadow-[0_0_15px_rgba(255,255,255,0.1)] flex items-center justify-center gap-2"
                                    >
                                        <CreditCard size={14} />
                                        Acquire Membership
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {showMembershipModal && (
                    <MembershipModal
                        user={user}
                        onClose={() => setShowMembershipModal(false)}
                        onUpdateUser={onUpdateUser}
                    />
                )}

                {/* Stats Hex Grid */}
                <div>
                    <div className="flex items-center mb-3 space-x-2">
                        <div className="h-3 w-1 bg-gaming-accent shadow-[0_0_8px_rgba(0,223,130,0.5)]"></div>
                        <h3 className="text-xs font-bold uppercase text-white tracking-widest">Combat Metrics</h3>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <StatBox icon={Crosshair} value={user.stats?.kills || 0} label="Eliminations" color="text-red-500" border="border-red-500/20" />
                        <StatBox icon={TrendingUp} value={user.stats?.kdRatio || 0} label="K/D Ratio" color="text-blue-500" border="border-blue-500/20" />
                        <StatBox icon={Award} value={user.stats?.wins || 0} label="Victories" color="text-gaming-accent" border="border-gaming-accent/20" />
                        <StatBox icon={Skull} value={user.stats?.matches || 0} label="Deployments" color="text-purple-500" border="border-purple-500/20" />
                    </div>
                </div>

                {/* NAVIGATION BUTTONS */}
                <div className="space-y-3">
                    <button
                        onClick={onNavigateToTeam}
                        className="w-full p-4 bg-[#0c0c12]/80 backdrop-blur-md border border-white/10 clip-corner-sm flex items-center justify-between group hover:border-gaming-accent/50 transition-colors"
                    >
                        <span className="flex items-center space-x-4">
                            <div className="p-2 bg-[#1a1a24] clip-corner-sm group-hover:bg-gaming-accent group-hover:text-black transition-colors text-gray-400">
                                <Shield size={18} />
                            </div>
                            <div className="text-left">
                                <span className="block text-xs font-bold uppercase tracking-wider text-white group-hover:text-gaming-accent transition-colors">Manage Squad</span>
                                <span className="text-[9px] text-gray-600 font-mono">
                                    {user.teamId ? 'UNIT ACTIVE' : 'NO SQUAD ASSIGNED'}
                                </span>
                            </div>
                        </span>
                        <ChevronRight size={16} className="text-gray-600 group-hover:text-gaming-accent" />
                    </button>

                    <button
                        onClick={onNavigateToSettings}
                        className="w-full p-4 bg-[#0c0c12]/80 backdrop-blur-md border border-white/10 clip-corner-sm flex items-center justify-between group hover:border-white/30 transition-all cyber-glimmer"
                    >
                        <span className="flex items-center space-x-4">
                            <div className="p-2 bg-[#1a1a24] clip-corner-sm group-hover:bg-white group-hover:text-black transition-colors text-gray-400">
                                <SettingsIcon size={18} />
                            </div>
                            <div className="text-left">
                                <span className="block text-xs font-bold uppercase tracking-wider text-white group-hover:text-gaming-accent transition-all">System Configuration</span>
                                <span className="text-[9px] text-gray-600 font-mono">v2.4.5 // STABLE</span>
                            </div>
                        </span>
                        <ChevronRight size={16} className="text-gray-600 group-hover:text-gaming-accent transition-all" />
                    </button>
                </div>

                {/* Match History */}
                <div>
                    <div className="flex items-center justify-between mb-3 px-1">
                        <div className="flex items-center space-x-2">
                            <div className="h-3 w-1 bg-gaming-accent"></div>
                            <h3 className="text-xs font-bold uppercase text-white tracking-widest">Match Archive</h3>
                        </div>
                        <span className="text-[9px] text-gray-600 font-mono uppercase">Decrypted Logs</span>
                    </div>
                    <MatchHistory history={user.matchHistory || []} />
                </div>
            </div>
        </PullToRefresh>
    );
};

const StatBox: React.FC<{ icon: any, value: any, label: string, color: string, border: string }> = ({ icon: Icon, value, label, color, border }) => (
    <div className={`bg-[#0c0c12]/80 backdrop-blur-md p-4 border ${border} clip-corner-sm flex flex-col items-center justify-center text-center relative overflow-hidden group transition-all hover:bg-white/5`}>
        <div className={`absolute -right-4 -bottom-4 opacity-10 group-hover:opacity-20 transition-opacity transform rotate-12 ${color}`}>
            <Icon size={64} />
        </div>
        <Icon className={`${color} mb-2 drop-shadow-md`} size={20} />
        <span className="text-2xl font-black text-white font-mono leading-none">{value}</span>
        <span className="text-[8px] text-gray-500 uppercase font-bold tracking-[0.2em] mt-1">{label}</span>
    </div>
);

export default Profile;
