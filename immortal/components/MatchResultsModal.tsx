import React, { useEffect, useState } from 'react';
import { X, Trophy, Users, Crosshair, Medal, Crown } from 'lucide-react';
import { Tournament } from '../types';
import PublicProfileModal from './PublicProfileModal';

interface MatchResultsModalProps {
    tournament: Tournament;
    onClose: () => void;
}

const MatchResultsModal: React.FC<MatchResultsModalProps> = ({ tournament, onClose }) => {
    const [allTeams, setAllTeams] = useState<any[]>([]);
    const [allUsers, setAllUsers] = useState<any[]>([]);
    const [viewProfileId, setViewProfileId] = useState<string | null>(null);

    useEffect(() => {
        const loadTeams = async () => {
            try {
                const { getTeams } = await import('../utils/teamStorage');
                const teams = await getTeams();
                setAllTeams(teams);
            } catch (error) {
                console.error('Failed to load teams', error);
            }
        };
        loadTeams();
    }, []);

    const results = tournament.matchResult?.scores || [];

    // Sort by Position if available, else Total Points
    const sortedResults = [...results].sort((a, b) => {
        if (a.position && b.position) return a.position - b.position;
        return b.totalPoints - a.totalPoints;
    });

    const top3 = sortedResults.filter(r => r.position >= 1 && r.position <= 3);

    const getParticipantDetails = (id: string) => {
        const team = allTeams.find(t => t.id === id);
        if (team) return { name: team.name, isTeam: true, image: team.logoUrl, banner: team.bannerUrl };

        const participant = tournament.participants?.find(p => p.id === id);
        const user = allUsers.find(u => u.id === id);
        const avatar = participant?.avatar || user?.avatarUrl;

        if (participant || user) return {
            name: participant?.name || user?.ign || 'Unknown',
            isTeam: false,
            image: avatar || `https://ui-avatars.com/api/?name=${participant?.name || user?.ign || 'U'}&background=random`,
            banner: null
        };

        return { name: 'Unknown', isTeam: false, image: '', banner: null };
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-[#0c0c12] border border-white/10 w-full max-w-5xl h-[90vh] overflow-hidden rounded-lg shadow-2xl relative flex flex-col cyber-border-green cyber-glimmer">

                {/* Header */}
                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#0c0c12] z-20">
                    <div>
                        <h2 className="text-3xl font-black italic text-white uppercase tracking-tighter flex items-center gap-3">
                            <Trophy size={28} className="text-gaming-accent drop-shadow-[0_0_8px_rgba(0,223,130,0.5)]" /> Match <span className="text-gaming-accent">Results</span>
                        </h2>
                        <p className="text-gray-500 font-mono text-xs uppercase tracking-[0.3em] mt-1">{tournament.title} // {tournament.map}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto relative scrollbar-hide">
                    {/* PODIUM SECTION */}
                    {top3.length > 0 && (
                        <div className="flex justify-center items-end gap-x-4 min-h-[380px] pb-12 pt-10 px-4 bg-[#0c0c12]/50 relative overflow-hidden mb-4">

                            {/* 2ND PLACE (Left) */}
                            {(() => {
                                const p = top3.find(r => r.position === 2);
                                if (!p) return <div className="w-32"></div>;
                                const d = getParticipantDetails(p.participantId);
                                return (
                                    <button
                                        onClick={() => !d.isTeam && setViewProfileId(p.participantId)}
                                        className={`relative group w-32 flex flex-col justify-end translate-y-4 transition-transform hover:-translate-y-2 ${!d.isTeam ? 'cursor-pointer' : ''}`}
                                    >
                                        <div className="bg-[#15151b] border border-gray-700 relative h-48 w-full shadow-[0_0_20px_rgba(0,0,0,0.5)] flex flex-col items-center pt-12 pb-4"
                                            style={{ clipPath: 'polygon(0% 20%, 20% 0%, 80% 0%, 100% 0%, 100% 100%, 0% 100%)' }}>

                                            <div className="absolute top-0 left-4 w-12 h-10 bg-[#0c0c12] border-b border-l border-r border-gray-600 flex items-center justify-center shadow-lg overflow-hidden"
                                                style={{ clipPath: 'polygon(0% 0%, 100% 0%, 100% 80%, 80% 100%, 0% 100%)' }}>
                                                <img src={d.image} alt={d.name} className="w-full h-full object-cover opacity-90" />
                                            </div>

                                            <div className="text-gray-500 font-bold text-xs uppercase mb-2">2ND</div>
                                            <div className="w-12 h-1 bg-gray-600 mb-3 shadow-[0_0_8px_rgba(75,85,99,0.5)]"></div>

                                            <h2 className="text-white font-black uppercase text-sm truncate max-w-[90%] px-1">{d.name}</h2>
                                            <p className="text-[10px] text-gray-400 font-mono mt-1 font-bold">{p.totalPoints} PTS</p>

                                            <div className="mt-auto w-full px-3">
                                                <div className="w-full h-8 bg-gray-800/30 rounded flex items-center justify-center border border-white/5 gap-1">
                                                    <Crosshair size={12} className="text-gray-500" />
                                                    <span className="font-mono font-bold text-white text-sm">{p.kills}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })()}

                            {/* 1ST PLACE (Center) */}
                            {(() => {
                                const p = top3.find(r => r.position === 1);
                                if (!p) return null;
                                const d = getParticipantDetails(p.participantId);
                                return (
                                    <button
                                        onClick={() => !d.isTeam && setViewProfileId(p.participantId)}
                                        className={`relative group w-40 flex flex-col justify-end z-10 -translate-y-0 transition-all hover:-translate-y-4 ${!d.isTeam ? 'cursor-pointer' : ''}`}
                                    >
                                        <div className="bg-[#15151b] border border-gaming-accent relative h-64 w-full shadow-[0_0_50px_rgba(0,223,130,0.25)] flex flex-col items-center pt-14 pb-6 cyber-border-green cyber-glimmer"
                                            style={{ clipPath: 'polygon(20% 0%, 80% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 20%)' }}>

                                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-12 bg-[#0c0c12] border-b border-l border-r border-gaming-accent flex items-center justify-center shadow-[0_0_20px_rgba(0,223,130,0.4)] overflow-hidden"
                                                style={{ clipPath: 'polygon(0% 0%, 100% 0%, 85% 100%, 15% 100%)' }}>
                                                <img src={d.image} alt={d.name} className="w-full h-full object-cover" />
                                            </div>

                                            <div className="text-gaming-accent font-black italic text-4xl mb-1 mt-4 drop-shadow-[0_0_10px_rgba(0,223,130,0.5)]">1ST</div>
                                            <div className="w-20 h-1.5 bg-gaming-accent mb-4 shadow-[0_0_20px_rgba(0,223,130,1)] rounded-full"></div>

                                            <h2 className="text-white font-black uppercase text-lg truncate max-w-[90%] px-1 tracking-wider">{d.name}</h2>
                                            <p className="text-xs text-gaming-accent font-mono mt-1 font-bold">{p.totalPoints} PTS</p>

                                            <div className="mt-auto w-full px-4">
                                                <div className="w-full h-10 bg-gaming-accent/20 rounded-lg flex items-center justify-center border border-gaming-accent/40 gap-1">
                                                    <Crosshair size={14} className="text-white" />
                                                    <span className="font-mono font-bold text-white text-lg">{p.kills}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })()}

                            {/* 3RD PLACE (Right) */}
                            {(() => {
                                const p = top3.find(r => r.position === 3);
                                if (!p) return <div className="w-32"></div>;
                                const d = getParticipantDetails(p.participantId);
                                return (
                                    <button
                                        onClick={() => !d.isTeam && setViewProfileId(p.participantId)}
                                        className={`relative group w-32 flex flex-col justify-end translate-y-8 transition-transform hover:-translate-y-0 ${!d.isTeam ? 'cursor-pointer' : ''}`}
                                    >
                                        <div className="bg-[#15151b] border border-orange-700 relative h-40 w-full shadow-[0_0_20px_rgba(0,0,0,0.5)] flex flex-col items-center pt-12 pb-4"
                                            style={{ clipPath: 'polygon(0% 0%, 80% 0%, 100% 20%, 100% 100%, 0% 100%, 0% 0%)' }}>

                                            <div className="absolute top-0 right-4 w-12 h-10 bg-[#0c0c12] border-b border-l border-r border-orange-700 flex items-center justify-center shadow-lg overflow-hidden"
                                                style={{ clipPath: 'polygon(20% 100%, 100% 100%, 100% 0%, 0% 0%)' }}>
                                                <img src={d.image} alt={d.name} className="w-full h-full object-cover opacity-90" />
                                            </div>

                                            <div className="text-orange-700 font-bold text-xs uppercase mb-2">3RD</div>
                                            <div className="w-12 h-1 bg-orange-700 mb-3 shadow-[0_0_8px_rgba(194,65,12,0.5)]"></div>

                                            <h2 className="text-white font-black uppercase text-sm truncate max-w-[90%] px-1">{d.name}</h2>
                                            <p className="text-[10px] text-gray-400 font-mono mt-1 font-bold">{p.totalPoints} PTS</p>

                                            <div className="mt-auto w-full px-3">
                                                <div className="w-full h-8 bg-gray-800/30 rounded flex items-center justify-center border border-white/5 gap-1">
                                                    <Crosshair size={12} className="text-gray-500" />
                                                    <span className="font-mono font-bold text-white text-sm">{p.kills}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })()}
                        </div>
                    )}

                    {/* Scoreboard List */}
                    <div className="p-4 md:p-8 space-y-2">
                        <div className="flex items-center gap-2 mb-4 text-gaming-accent pl-2 border-l-2 border-gaming-accent">
                            <Users size={16} />
                            <span className="text-xs uppercase font-bold tracking-widest">Full Leaderboard</span>
                        </div>

                        {sortedResults.map((result, index) => {
                            const d = getParticipantDetails(result.participantId);
                            const rank = index + 1;
                            const isPodium = rank <= 3;

                            return (
                                <div
                                    key={result.participantId}
                                    onClick={() => !d.isTeam && setViewProfileId(result.participantId)}
                                    className={`
                                        bg-[#0c0c12]/60 backdrop-blur p-3 clip-corner-sm border border-white/5 flex items-center justify-between 
                                        hover:bg-white/5 hover:border-gaming-primary/30 transition-all group
                                        ${!d.isTeam ? 'cursor-pointer' : ''}
                                        ${rank === 1 ? 'border-gaming-accent/30' : ''}
                                    `}
                                >
                                    <div className="flex items-center space-x-4">
                                        <div className={`w-8 h-8 flex items-center justify-center font-black text-xl italic ${isPodium ? (rank === 1 ? 'text-gaming-accent' : rank === 2 ? 'text-gray-400' : 'text-orange-500') : 'text-gray-600'}`}>
                                            #{rank < 10 ? `0${rank}` : rank}
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded overflow-hidden bg-black border ${isPodium ? (rank === 1 ? 'border-gaming-accent/50' : 'border-white/20') : 'border-white/10'}`}>
                                                <img src={d.image} alt={d.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-bold text-white text-sm uppercase tracking-tight group-hover:text-gaming-accent transition-colors">{d.name}</h3>
                                                    {!d.isTeam && <span className="text-[9px] bg-white/10 text-gray-500 px-1 rounded transition-colors group-hover:bg-gaming-accent group-hover:text-black">PROFILE</span>}
                                                </div>
                                                <p className="text-[10px] text-gray-500 font-mono tracking-wider flex items-center gap-2">
                                                    <span className="group-hover:text-white transition-colors">{result.kills} KILLS</span>
                                                    {d.isTeam && <span className="text-gaming-accent font-bold tracking-[0.2em] animate-pulse">TEAM</span>}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="text-right bg-black/40 px-3 py-1 clip-corner-sm border border-white/5 min-w-[80px] group-hover:border-gaming-accent/30 transition-all">
                                        <span className={`block font-mono font-bold text-sm ${rank === 1 ? 'text-gaming-accent' : 'text-white'}`}>{result.totalPoints}</span>
                                        <span className="text-[8px] uppercase text-gray-500 font-bold tracking-widest">PTS</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Profile Modal Overlay */}
                {viewProfileId && (
                    <div className="absolute inset-0 z-50">
                        <PublicProfileModal userId={viewProfileId} onClose={() => setViewProfileId(null)} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default MatchResultsModal;
