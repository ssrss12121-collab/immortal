import React, { useEffect, useState } from 'react';
import { X, Trophy, Shield, Crosshair, Zap, Target, Copy, Check } from 'lucide-react';
import { UserProfile } from '../types';
import { getUserById } from '../utils/auth';

interface PublicProfileModalProps {
    userId: string;
    onClose: () => void;
}

const PublicProfileModal: React.FC<PublicProfileModalProps> = ({ userId, onClose }) => {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            if (!userId) return;
            try {
                const userData = await getUserById(userId);
                setUser(userData);
            } catch (error) {
                console.error("Failed to fetch user profile", error);
            }
        };
        fetchUser();
    }, [userId]);

    const copyId = () => {
        navigator.clipboard.writeText(userId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!user) return null;

    const roleIcons: any = {
        'Rusher': Zap,
        'Sniper': Crosshair,
        'Nader': Target,
        'Supporter': Shield
    };

    const RoleIcon = roleIcons[user.role] || Shield;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[#0c0c12] border-x-0 border-y-0 md:border border-white/10 w-full max-w-md h-full md:h-auto overflow-y-auto md:rounded-lg rounded-none relative shadow-2xl animate-in zoom-in-95 duration-200">
                {/* Header / Banner */}
                <div className="h-32 bg-gradient-to-r from-gaming-primary/20 to-gaming-accent/20 relative">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-white/20 transition-colors z-10"
                    >
                        <X size={20} />
                    </button>
                    <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
                        <div className="w-24 h-24 rounded-full border-4 border-[#0c0c12] overflow-hidden bg-gray-800">
                            <img
                                src={user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`}
                                alt={user.ign}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="pt-14 pb-8 px-6 text-center">
                    <h2 className="text-2xl font-black text-white italic tracking-wider mb-1">{user.ign}</h2>
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <span className="text-xs text-gray-500 font-mono">UID: {user.id}</span>
                        <button onClick={copyId} className="text-gray-500 hover:text-white transition-colors">
                            {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
                        </button>
                    </div>

                    {/* Role Badge */}
                    <div className="flex flex-col items-center gap-2 mb-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10">
                            <RoleIcon size={14} className="text-gaming-accent" />
                            <span className="text-xs font-bold text-white uppercase tracking-wider">{user.role}</span>
                        </div>
                        <div className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em]">
                            {user.country || 'Bangladesh'} • {user.district || 'Global'}
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="bg-white/5 p-3 rounded border border-white/5">
                            <div className="text-xs text-gray-500 uppercase font-bold mb-1">Rank Points</div>
                            <div className="text-xl font-black text-gaming-primary">{user.stats.rankPoints}</div>
                        </div>
                        <div className="bg-white/5 p-3 rounded border border-white/5">
                            <div className="text-xs text-gray-500 uppercase font-bold mb-1">K/D Ratio</div>
                            <div className="text-xl font-black text-white">{user.stats.kdRatio}</div>
                        </div>
                        <div className="bg-white/5 p-3 rounded border border-white/5">
                            <div className="text-xs text-gray-500 uppercase font-bold mb-1">Matches</div>
                            <div className="text-xl font-black text-white">{user.stats.matches}</div>
                        </div>
                    </div>

                    {/* Team Info */}
                    {user.teamId && (
                        <div className="bg-gaming-primary/10 border border-gaming-primary/20 p-4 rounded-lg flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Shield size={20} className="text-gaming-primary" />
                                <div className="text-left">
                                    <div className="text-[10px] text-gaming-primary uppercase font-bold tracking-wider">Team Member</div>
                                    <div className="text-white font-bold text-sm">
                                        {/* We would ideally fetch team name here, but for now just show ID or generic */}
                                        Team #{user.teamId.substring(0, 6)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PublicProfileModal;
