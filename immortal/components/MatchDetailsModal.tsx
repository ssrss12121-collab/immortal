import React from 'react';
import { Tournament, UserProfile } from '../types';
import { X, Clock, Shield, Lock, Unlock, Copy, Users, Trophy } from 'lucide-react';

interface MatchDetailsModalProps {
    tournament: Tournament;
    user: UserProfile | null;
    onClose: () => void;
}

const MatchDetailsModal: React.FC<MatchDetailsModalProps> = ({ tournament, user, onClose }) => {

    const [captainId, setCaptainId] = React.useState<string | null>(null);

    React.useEffect(() => {
        const loadCaptain = async () => {
            if (user?.teamId) {
                try {
                    const { getTeamById } = await import('../utils/teamStorage');
                    const team = await getTeamById(user.teamId);
                    if (team) setCaptainId(team.captainId);
                } catch (error) {
                    console.error("Failed to fetch team", error);
                }
            }
        };
        loadCaptain();
    }, [user?.teamId]);

    const getAccessStatus = (groupId?: string): { canView: boolean; message?: string } => {
        if (!user) return { canView: false, message: "Login Required" };

        // 1. Check direct participation (Solo)
        const directParticipant = tournament.participants?.find(p =>
            !p.isTeam &&
            String(p.id) === String(user.id) &&
            (!groupId || p.groupId === groupId)
        );

        if (directParticipant) return { canView: true };

        // 2. Check Team participation
        const teamParticipant = tournament.participants?.find(p =>
            p.isTeam &&
            p.members?.some(m => String(m.id) === String(user.id)) &&
            (!groupId || p.groupId === groupId)
        );

        if (teamParticipant) {
            if (captainId && String(captainId) === String(user.id)) {
                return { canView: true };
            } else {
                return { canView: false, message: "Captain Only" };
            }
        }

        return { canView: false, message: "Restricted Access" };
    };

    const canViewCredentials = (group: any) => {
        if (!group.credentialsPublished) return false;
        const status = getAccessStatus(group.id);
        return status.canView;
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert("Copied to clipboard!");
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-[#0c0c12] border border-white/10 w-full max-w-md max-h-[90vh] overflow-y-auto clip-corner relative shadow-[0_0_50px_rgba(0,0,0,0.8)]">

                {/* Header */}
                <div className="sticky top-0 z-10 bg-[#0c0c12]/95 backdrop-blur border-b border-white/10 p-4 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-black italic uppercase text-white tracking-wide">Match Intel</h2>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{tournament.title}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <X size={20} className="text-gray-400" />
                    </button>
                </div>

                <div className="p-4 space-y-6">

                    {/* MATCH RESULTS / PODIUM */}
                    {tournament.status === 'Completed' && tournament.matchResult?.published && (
                        <div className="rounded-xl overflow-hidden border border-gaming-accent/30 relative mb-6">
                            {(() => {
                                const scores = tournament.matchResult?.scores || [];
                                const top3 = scores.filter((s: any) => s.position >= 1 && s.position <= 3).sort((a: any, b: any) => a.position - b.position);
                                const first = top3.find((s: any) => s.position === 1);

                                // Get details for 1st place to show banner
                                const getParticipantDetails = (pid: string) => {
                                    const p = tournament.participants?.find(part => String(part.id) === String(pid));
                                    if (p) return {
                                        name: p.name,
                                        image: p.avatar || `https://ui-avatars.com/api/?name=${p.name}&background=random`,
                                        banner: null, // Banners might not be in the participant object, but that's fine for now
                                        isTeam: p.isTeam
                                    };

                                    return { name: 'Unknown', image: '', banner: null, isTeam: false };
                                };

                                const winnerDetails = first ? getParticipantDetails(first.participantId) : null;

                                return (
                                    <div className="relative">
                                        {/* Dynamic Banner Background */}
                                        <div className="absolute inset-0 bg-cover bg-center opacity-40" style={{ backgroundImage: winnerDetails?.banner ? `url(${winnerDetails.banner})` : `url(https://img.freepik.com/free-vector/abstract-grunge-style-coming-soon-with-black-splatter-design_1017-26690.jpg)` }}></div>
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c12] via-[#0c0c12]/80 to-transparent"></div>

                                        <div className="relative z-10 p-6 flex flex-col items-center justify-center text-center">

                                            {/* 1st Place */}
                                            {first && winnerDetails && (
                                                <div className="mb-6 animate-slide-up">
                                                    <div className="relative inline-block">
                                                        <div className="w-24 h-24 rounded-full border-4 border-gaming-accent overflow-hidden shadow-[0_0_20px_rgba(0,223,130,0.5)] mb-3 bg-black">
                                                            <img src={winnerDetails.image} alt="Winner" className="w-full h-full object-cover" />
                                                        </div>
                                                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gaming-accent text-black font-black text-xs px-2 py-0.5 rounded shadow-lg uppercase tracking-widest flex items-center gap-1">
                                                            <Trophy size={10} fill="black" /> Winner
                                                        </div>
                                                    </div>
                                                    <h1 className="text-2xl font-black italic uppercase text-white tracking-widest drop-shadow-md">{winnerDetails.name}</h1>
                                                    <div className="flex justify-center gap-4 mt-2">
                                                        <div className="bg-red-500/20 border border-red-500/30 px-3 py-1 rounded flex items-center gap-2">
                                                            <span className="text-red-500 font-bold text-xs uppercase tracking-wider">Kills</span>
                                                            <span className="text-white font-mono font-bold text-sm">{first.kills}</span>
                                                        </div>
                                                        <div className="bg-gaming-accent/20 border border-gaming-accent/30 px-3 py-1 rounded flex items-center gap-2">
                                                            <span className="text-gaming-accent font-bold text-xs uppercase tracking-wider">Points</span>
                                                            <span className="text-white font-mono font-bold text-sm">{first.totalPoints}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* 2nd & 3rd Place */}
                                            {top3.length > 1 && (
                                                <div className="grid grid-cols-2 gap-4 w-full mt-4 border-t border-white/10 pt-4">
                                                    {top3.filter((s: any) => s.position > 1).map((s: any) => {
                                                        const details = getParticipantDetails(s.participantId);
                                                        const borderColor = s.position === 2 ? 'border-gray-500' : 'border-amber-700';
                                                        return (
                                                            <div key={s.participantId} className="bg-black/40 rounded p-3 flex items-center gap-3 border border-white/5">
                                                                <div className={`w-10 h-10 rounded-full border-2 ${borderColor} overflow-hidden shrink-0`}>
                                                                    <img src={details.image} alt="Rank" className="w-full h-full object-cover" />
                                                                </div>
                                                                <div className="text-left overflow-hidden">
                                                                    <div className={`text-[10px] font-bold uppercase ${s.position === 2 ? 'text-gray-400' : 'text-amber-600'}`}>#{s.position} Place</div>
                                                                    <div className="font-bold text-white text-sm truncate">{details.name}</div>
                                                                    <div className="text-[10px] text-gray-500 font-mono">{s.totalPoints} PTS • {s.kills} Kills</div>
                                                                </div>
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )
                            })()}
                        </div>
                    )}

                    {tournament.isUnlimited && tournament.groups && tournament.groups.length > 0 ? (
                        <div className="space-y-4">
                            {tournament.groups.map(group => {
                                const isAuthorized = canViewCredentials(group);
                                const isMyGroup = user?.teamId && tournament.participants?.some(p => String(p.id) === String(user.teamId) && p.groupId === group.id);
                                const isDirectlyInGroup = user && tournament.participants?.some(p => String(p.id) === String(user.id) && p.groupId === group.id);

                                return (
                                    <div key={group.id} className={`border ${isMyGroup || isDirectlyInGroup ? 'border-gaming-accent/30 bg-gaming-accent/5' : 'border-white/5 bg-white/5'} rounded-lg overflow-hidden`}>
                                        <div className="p-3 border-b border-white/5 flex justify-between items-center bg-black/20">
                                            <h3 className={`font-bold uppercase text-sm ${isMyGroup || isDirectlyInGroup ? 'text-gaming-accent' : 'text-gray-300'}`}>
                                                {group.name} {(isMyGroup || isDirectlyInGroup) && "(YOUR UNIT)"}
                                            </h3>
                                            <div className="flex items-center gap-2 text-xs font-mono text-gray-400">
                                                <Clock size={12} />
                                                {group.schedule || 'TBA'}
                                            </div>
                                        </div>

                                        {/* Credentials Section */}
                                        <div className="p-3 bg-black/40 border-b border-white/5">
                                            {isAuthorized ? (
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="bg-green-900/20 border border-green-500/30 p-2 rounded relative group cursor-pointer" onClick={() => copyToClipboard(group.roomId || '')}>
                                                        <label className="text-[8px] text-green-500 uppercase font-bold block mb-1">Room ID</label>
                                                        <div className="font-mono text-white font-bold flex items-center gap-2">
                                                            {group.roomId} <Copy size={10} className="opacity-50" />
                                                        </div>
                                                    </div>
                                                    <div className="bg-green-900/20 border border-green-500/30 p-2 rounded relative group cursor-pointer" onClick={() => copyToClipboard(group.roomPassword || '')}>
                                                        <label className="text-[8px] text-green-500 uppercase font-bold block mb-1">Password</label>
                                                        <div className="font-mono text-white font-bold flex items-center gap-2">
                                                            {group.roomPassword} <Copy size={10} className="opacity-50" />
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-center gap-2 p-2 text-gray-500 text-xs bg-black/20 rounded border border-white/5 border-dashed">
                                                    {group.credentialsPublished ? (
                                                        <>
                                                            <Lock size={12} />
                                                            <span className="uppercase font-bold tracking-wider">
                                                                {getAccessStatus(group.id).message}
                                                            </span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Clock size={12} />
                                                            <span className="uppercase font-bold tracking-wider">Credentials Pending</span>
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* Slots Grid */}
                                        <div className="p-3">
                                            <h4 className="text-[9px] text-gray-500 uppercase font-bold tracking-widest mb-2">Squad Slots</h4>
                                            <div className="grid grid-cols-4 gap-2">
                                                {Array.from({ length: 12 }).map((_, index) => {
                                                    const participantsInGroup = tournament.participants?.filter(p => p.groupId === group.id) || [];
                                                    const participant = participantsInGroup[index];

                                                    return (
                                                        <div key={index} className={`aspect-square rounded border flex flex-col items-center justify-center p-1 relative overflow-hidden ${participant ? 'bg-gaming-accent/10 border-gaming-accent/30' : 'bg-white/5 border-white/5'}`}>
                                                            {participant ? (
                                                                <>
                                                                    <div className="w-6 h-6 rounded-full bg-black border border-gaming-accent/50 mb-1 overflow-hidden">
                                                                        <img src={`https://ui-avatars.com/api/?name=${participant.name}&background=random`} alt={participant.name} className="w-full h-full object-cover" />
                                                                    </div>
                                                                    <span className="text-[8px] font-bold text-white truncate w-full text-center leading-none">{participant.name}</span>
                                                                    <div className="absolute top-0 right-0 bg-gaming-accent text-black text-[6px] font-bold px-1 rounded-bl-sm">#{index + 1}</div>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <span className="text-[8px] text-gray-600 font-bold mb-1">OPEN</span>
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-gray-800"></div>
                                                                    <div className="absolute top-0 right-0 bg-gray-800 text-gray-500 text-[6px] font-bold px-1 rounded-bl-sm">#{index + 1}</div>
                                                                </>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        /* Global Match Details (No Groups) */
                        <div className="space-y-4">
                            {/* Global Credentials */}
                            <div className="bg-black/40 border border-white/5 rounded-lg overflow-hidden">
                                <div className="p-3 border-b border-white/5 bg-white/5">
                                    <h3 className="font-bold uppercase text-sm text-gray-300">Match Credentials</h3>
                                </div>
                                <div className="p-3">
                                    {(() => {
                                        // Global Credential Visibility Logic
                                        if (!tournament.credentialsPublished) {
                                            return (
                                                <div className="flex items-center justify-center gap-2 p-4 text-gray-500 text-xs bg-black/20 rounded border border-white/5 border-dashed">
                                                    <Clock size={12} />
                                                    <span className="uppercase font-bold tracking-wider">Credentials Pending</span>
                                                </div>
                                            );
                                        }

                                        const { canView, message } = getAccessStatus();

                                        if (canView) {
                                            return (
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="bg-green-900/20 border border-green-500/30 p-2 rounded relative group cursor-pointer" onClick={() => copyToClipboard(tournament.roomId || '')}>
                                                        <label className="text-[8px] text-green-500 uppercase font-bold block mb-1">Room ID</label>
                                                        <div className="font-mono text-white font-bold flex items-center gap-2">
                                                            {tournament.roomId} <Copy size={10} className="opacity-50" />
                                                        </div>
                                                    </div>
                                                    <div className="bg-green-900/20 border border-green-500/30 p-2 rounded relative group cursor-pointer" onClick={() => copyToClipboard(tournament.roomPassword || '')}>
                                                        <label className="text-[8px] text-green-500 uppercase font-bold block mb-1">Password</label>
                                                        <div className="font-mono text-white font-bold flex items-center gap-2">
                                                            {tournament.roomPassword} <Copy size={10} className="opacity-50" />
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        } else {
                                            return (
                                                <div className="flex items-center justify-center gap-2 p-4 text-gray-500 text-xs bg-black/20 rounded border border-white/5 border-dashed">
                                                    <Lock size={12} />
                                                    <span className="uppercase font-bold tracking-wider">{message}</span>
                                                </div>
                                            );
                                        }
                                    })()}
                                </div>
                            </div>

                            {/* All Slots Grid */}
                            <div className="border border-white/5 bg-white/5 rounded-lg overflow-hidden">
                                <div className="p-3 border-b border-white/5 bg-black/20">
                                    <h3 className="font-bold uppercase text-sm text-gray-300">Lobby Slots</h3>
                                </div>
                                <div className="p-3">
                                    <div className="grid grid-cols-4 gap-2">
                                        {Array.from({ length: tournament.slots }).map((_, index) => {
                                            const participant = tournament.participants?.[index];
                                            return (
                                                <div key={index} className={`aspect-square rounded border flex flex-col items-center justify-center p-1 relative overflow-hidden ${participant ? 'bg-gaming-accent/10 border-gaming-accent/30' : 'bg-white/5 border-white/5'}`}>
                                                    {participant ? (
                                                        <>
                                                            <div className="w-6 h-6 rounded-full bg-black border border-gaming-accent/50 mb-1 overflow-hidden">
                                                                <img src={`https://ui-avatars.com/api/?name=${participant.name}&background=random`} alt={participant.name} className="w-full h-full object-cover" />
                                                            </div>
                                                            <span className="text-[8px] font-bold text-white truncate w-full text-center leading-none">{participant.name}</span>
                                                            <div className="absolute top-0 right-0 bg-gaming-accent text-black text-[6px] font-bold px-1 rounded-bl-sm">#{index + 1}</div>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <span className="text-[8px] text-gray-600 font-bold mb-1">OPEN</span>
                                                            <div className="w-1.5 h-1.5 rounded-full bg-gray-800"></div>
                                                            <div className="absolute top-0 right-0 bg-gray-800 text-gray-500 text-[6px] font-bold px-1 rounded-bl-sm">#{index + 1}</div>
                                                        </>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div >
                    )}

                    {/* Unassigned Participants */}
                    {
                        tournament.participants?.some(p => !p.groupId) && (
                            <div className="border border-white/5 bg-white/5 rounded-lg p-3">
                                <h3 className="font-bold uppercase text-xs text-gray-400 mb-3">Pending Assignment</h3>
                                <div className="flex flex-wrap gap-2">
                                    {tournament.participants.filter(p => !p.groupId).map(p => (
                                        <span key={p.id} className="text-xs bg-black/40 border border-white/10 px-2 py-1 rounded text-gray-400">
                                            {p.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )
                    }

                </div >
            </div >
        </div >
    );
};

export default MatchDetailsModal;
