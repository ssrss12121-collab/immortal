import React, { useState } from 'react';
import { Trash2, Shield, Calendar, Map, Users, CheckCircle, Award, Volume2, VolumeX, X, AlertTriangle, Trophy, ExternalLink, Image as ImageIcon, Zap } from 'lucide-react';
import { Tournament, UserProfile, Team } from '../types';
import { joinTournament } from '../utils/tournamentStorage';
import { getTeamByUserId } from '../utils/teamStorage';
import { auth } from '../utils/auth';

import PublicProfileModal from './PublicProfileModal';

interface TournamentDetailsModalProps {
    tournament: Tournament;
    user: any; // UserProfile, keeping any to match existing loose typing if needed, but preferably UserProfile
    onClose: () => void;
}

const TournamentDetailsModal: React.FC<TournamentDetailsModalProps> = ({ tournament, user, onClose }) => {
    const [isBooking, setIsBooking] = useState(false);
    const [bookingStatus, setBookingStatus] = useState<'IDLE' | 'SUCCESS' | 'ERROR'>('IDLE');
    const [message, setMessage] = useState('');

    const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
    const [userTeam, setUserTeam] = useState<any>(null);
    const [viewProfileId, setViewProfileId] = useState<string | null>(null);
    const [winnerTeam, setWinnerTeam] = useState<Team | null>(null);

    React.useEffect(() => {
        if (tournament.status === 'Completed' && tournament.matchResult?.published) {
            const firstPlace = tournament.matchResult.scores.find(s => s.position === 1);
            if (firstPlace) {
                const participant = tournament.participants?.find(p => p.id === firstPlace.participantId);
                if (participant?.isTeam) {
                    getTeamByUserId(participant.id).then(team => {
                        if (team) setWinnerTeam(team);
                    });
                }
            }
        }
    }, [tournament]);
    const [isMuted, setIsMuted] = useState(false);

    const getYoutubeId = (url: string) => {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    React.useEffect(() => {
        if (user && user.id) {
            // Always try to fetch team by user ID to ensure we find it even if teamId is missing from session
            getTeamByUserId(user.id).then(team => {
                if (team) setUserTeam(team);
            });
        }
    }, [user]);

    const toggleMember = (memberId: string) => {
        if (selectedMembers.includes(memberId)) {
            setSelectedMembers(prev => prev.filter(id => id !== memberId));
        } else {
            if (tournament.category === 'Duo' && selectedMembers.length >= 2) return;
            if (tournament.category === 'Squad' && selectedMembers.length >= 4) return;
            setSelectedMembers(prev => [...prev, memberId]);
        }
    };

    const handleBookSlot = async () => {
        if (!user) {
            setMessage("Please login first.");
            setBookingStatus('ERROR');
            return;
        }

        if (auth.isGuest(user)) {
            setMessage("REGISTRATION REQUIRED: Please create a full account to participate in tournaments.");
            setBookingStatus('ERROR');
            return;
        }

        if (tournament.category !== 'Solo') {
            if (!userTeam) {
                setMessage("PROTOCOAL FAILURE: Squad Identity Not Found. Create a Team first.");
                setBookingStatus('ERROR');
                return;
            }
            if (userTeam.captainId !== user.id) {
                setMessage("ACCESS DENIED: Only the Squad Leader can initiate deployment.");
                setBookingStatus('ERROR');
                return;
            }

            // Strict Squad Validation Rule
            if (tournament.category === 'Squad' && userTeam.members.length < 4) {
                setMessage("INSUFFICIENT MANPOWER: A full 4-man Squad is required for deployment.");
                setBookingStatus('ERROR');
                return;
            }

            const requiredCount = tournament.category === 'Duo' ? 2 : 4;
            if (selectedMembers.length !== requiredCount) {
                setMessage(`TACTICAL ERROR: Select exactly ${requiredCount} operatives for this mission.`);
                setBookingStatus('ERROR');
                return;
            }
        }

        setIsBooking(true);

        try {
            // Membership check for premium tournaments
            if (tournament.isPremium) {
                const isSubscribed = user.membership?.expiresAt && new Date(user.membership.expiresAt) > new Date();
                if (!isSubscribed) {
                    setMessage("PREMIUM ACCESS REQUIRED: Upgrade credentials to join this operation.");
                    setBookingStatus('ERROR');
                    return;
                }
            }

            const members = userTeam ? userTeam.members.filter((m: any) => selectedMembers.includes(m.id)).map((m: any) => ({ id: m.id, name: m.ign })) : [];
            const result = await joinTournament(tournament.id, user, members);

            if (result.success) {
                setBookingStatus('SUCCESS');
                setMessage(result.message);
            } else {
                setBookingStatus('ERROR');
                setMessage(result.message);
            }

            // Reload page or trigger refresh? Ideally refresh parent list.
            // For now, modal success is enough.
        } catch (error: any) {
            setBookingStatus('ERROR');
            setMessage(error.response?.data?.message || 'Failed to join tournament');
        } finally {
            setIsBooking(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
            <div className="bg-[#0c0c12] border-x-0 border-y-0 md:border border-white/10 w-full max-w-2xl h-full md:h-auto md:max-h-[90vh] overflow-y-auto rounded-none md:rounded-lg shadow-2xl relative cyber-glimmer">

                {/* Header Media (Video or Image) */}
                <div className="h-48 relative group overflow-hidden bg-black">
                    {tournament.videoUrl ? (
                        (() => {
                            const ytId = getYoutubeId(tournament.videoUrl);
                            if (ytId) {
                                return (
                                    <div className="w-full h-full relative overflow-hidden">
                                        <iframe
                                            className="w-full h-[180%] -top-[40%] absolute object-cover opacity-100"
                                            src={`https://www.youtube.com/embed/${ytId}?autoplay=1&mute=${isMuted ? 1 : 0}&controls=0&showinfo=0&rel=0&loop=1&playlist=${ytId}&modestbranding=1&iv_load_policy=3&disablekb=1&enablejsapi=1&origin=${window.location.origin}`}
                                            title="Tournament Video"
                                            allow="autoplay; encrypted-media"
                                        />
                                        <div className="absolute inset-0 bg-transparent z-10"></div>
                                    </div>
                                );
                            } else {
                                return (
                                    <video
                                        src={tournament.videoUrl}
                                        className="w-full h-full object-cover opacity-100"
                                        autoPlay
                                        muted={isMuted}
                                        loop
                                        playsInline
                                    />
                                );
                            }
                        })()
                    ) : (
                        <img src={tournament.image} className="w-full h-full object-cover opacity-50" alt={tournament.title} />
                    )}

                    <div className="absolute bottom-0 left-0 right-0 h-2/3 bg-gradient-to-t from-[#0c0c12] to-transparent pointer-events-none"></div>

                    {tournament.videoUrl && (
                        <button
                            onClick={() => setIsMuted(!isMuted)}
                            className="absolute bottom-4 right-4 z-20 bg-black/60 p-2 rounded-full text-white hover:bg-gaming-accent hover:text-black transition-colors"
                            title={isMuted ? "Unmute" : "Mute"}
                        >
                            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                        </button>
                    )}

                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 bg-black/50 p-2 rounded-full text-white hover:bg-red-600 transition-colors z-20"
                    >
                        <X size={20} />
                    </button>
                    <div className="absolute bottom-4 left-6 pointer-events-none">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="bg-gaming-accent/20 border border-gaming-accent/30 px-2 py-0.5 rounded">
                                <span className="text-[10px] font-bold uppercase text-gaming-accent">{tournament.category}</span>
                            </div>
                            <span className="bg-white/10 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase border border-white/10 backdrop-blur-md">{tournament.map}</span>
                        </div>
                        <h2 className="text-3xl font-black italic text-white uppercase tracking-wide drop-shadow-[0_0_10px_rgba(0,0,0,0.5)]">{tournament.title}</h2>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    {/* RESULTS SECTION (IF COMPLETED) */}
                    {tournament.status === 'Completed' && tournament.matchResult?.published && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="h-4 w-1.5 bg-gaming-accent shadow-[0_0_10px_#00ff9d]"></div>
                                <h3 className="text-sm font-black uppercase text-white tracking-[0.2em]">Final Mission Report</h3>
                            </div>

                            {/* Top 3 Champions Highlight */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {[1, 2, 3].map(pos => {
                                    const score = tournament.matchResult?.scores.find(s => s.position === pos);
                                    if (!score) return null;
                                    const participant = tournament.participants?.find(p => p.id === score.participantId);
                                    if (!participant) return null;

                                    return (
                                        <div key={pos} className={`relative overflow-hidden clip-corner-sm border border-white/10 p-4 flex flex-col items-center justify-center text-center transition-all ${pos === 1 ? 'bg-gaming-accent/10 border-gaming-accent/30 md:scale-110 md:z-10 shadow-[0_0_30px_rgba(0,223,130,0.2)] order-1 md:order-2' :
                                            pos === 2 ? 'bg-gray-400/5 order-2 md:order-1' : 'bg-orange-500/5 order-3'
                                            }`}>
                                            {/* Rank Badge */}
                                            <div className={`absolute top-0 right-0 px-3 py-1 font-black text-[10px] uppercase tracking-widest z-20 ${pos === 1 ? 'bg-gaming-accent text-black shadow-lg' : pos === 2 ? 'bg-gray-400 text-black' : 'bg-orange-500 text-black'
                                                }`}>
                                                Rank {pos}
                                            </div>

                                            {/* Team Banner Background for #1 */}
                                            {pos === 1 && participant.isTeam && winnerTeam?.bannerUrl && (
                                                <div className="absolute inset-0 opacity-20 z-0">
                                                    <img src={winnerTeam.bannerUrl} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" alt="" />
                                                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0c0c12]/80 to-[#0c0c12]"></div>
                                                </div>
                                            )}

                                            {/* Avatar/Logo */}
                                            <div className="w-20 h-20 rounded-full mb-3 relative z-10">
                                                <div className={`absolute inset-0 rounded-full animate-pulse-slow ${pos === 1 ? 'shadow-[0_0_20px_rgba(0,223,130,0.4)]' : ''}`}></div>
                                                <img
                                                    src={(pos === 1 && participant.isTeam && winnerTeam?.logoUrl) ? winnerTeam.logoUrl : (participant.avatar || 'https://api.dicebear.com/7.x/identicon/svg?seed=' + participant.id)}
                                                    className={`w-full h-full rounded-full object-cover border-2 ${pos === 1 ? 'border-gaming-accent' : pos === 2 ? 'border-gray-400' : 'border-orange-500'
                                                        }`}
                                                    alt=""
                                                />
                                                <div className="absolute -bottom-1 -right-1">
                                                    <Award size={24} className={pos === 1 ? 'text-gaming-accent bg-[#0c0c12] rounded-full' : pos === 2 ? 'text-gray-400' : 'text-orange-500'} />
                                                </div>
                                            </div>

                                            <div className="relative z-10">
                                                <h4 className="text-white font-black uppercase text-sm tracking-widest truncate w-full shadow-black drop-shadow-md">{participant.name}</h4>
                                                <p className="text-[10px] text-gray-500 font-bold uppercase mt-1">{participant.isTeam ? participant.teamName : 'Elite Operative'}</p>
                                            </div>

                                            <div className="mt-3 grid grid-cols-2 w-full gap-2 border-t border-white/5 pt-3 relative z-10">
                                                <div>
                                                    <p className="text-[8px] text-gray-600 uppercase font-bold">Kills</p>
                                                    <p className="text-xs font-black text-red-500">{score.kills}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[8px] text-gray-600 uppercase font-bold">Incentive</p>
                                                    <p className="text-xs font-black text-green-500">
                                                        ৳{(tournament.prizeList?.[pos - 1] || 0).toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Full Scoreboard */}
                            <div className="bg-black/40 border border-white/10 rounded-lg overflow-hidden">
                                <div className="px-4 py-2 bg-white/5 border-b border-white/10 flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-gray-400 font-mono">
                                    <span>Participant Debrief</span>
                                    <span>Performance Summary</span>
                                </div>
                                <div className="divide-y divide-white/5 max-h-[300px] overflow-y-auto">
                                    {tournament.matchResult?.scores.sort((a, b) => (a.position || 99) - (b.position || 99)).map((score, idx) => {
                                        const participant = tournament.participants?.find(p => p.id === score.participantId);
                                        return (
                                            <div key={idx} className="p-3 flex items-center justify-between hover:bg-white/5 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <span className="w-5 text-[10px] font-black text-gray-600">#{score.position || idx + 1}</span>
                                                    <div className="w-8 h-8 rounded border border-white/10 overflow-hidden">
                                                        <img src={participant?.avatar || 'https://api.dicebear.com/7.x/identicon/svg?seed=' + score.participantId} className="w-full h-full object-cover" alt="" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold text-white uppercase">{participant?.name}</p>
                                                        <p className="text-[8px] text-gray-500 uppercase">{participant?.isTeam ? 'Team Unit' : 'Soloist'}</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-4 text-right">
                                                    <div className="flex flex-col items-center">
                                                        <span className="text-[8px] text-gray-600 font-black uppercase">Kills</span>
                                                        <span className="text-xs font-black text-white">{score.kills}</span>
                                                    </div>
                                                    <div className="flex flex-col items-center">
                                                        <span className="text-[8px] text-gray-600 font-black uppercase">Points</span>
                                                        <span className="text-xs font-black text-gaming-accent">{score.totalPoints}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white/5 p-3 rounded clip-corner-sm border border-white/5">
                            <p className="text-[8px] text-gray-500 uppercase font-bold tracking-widest">Prize Pool</p>
                            <p className="text-xl font-bold text-gaming-accent">৳{(tournament.prizePool || 0).toLocaleString()}</p>
                        </div>
                        <div className="bg-white/5 p-3 rounded clip-corner-sm border border-white/5">
                            <p className="text-[8px] text-gray-500 uppercase font-bold tracking-widest">Access Type</p>
                            <p className={`text-xl font-bold flex items-center gap-1 ${tournament.isPremium ? 'text-gaming-accent' : 'text-white'}`}>
                                {tournament.isPremium ? <Zap size={16} fill="currentColor" /> : null}
                                {tournament.isPremium ? 'PREMIUM' : 'OPEN'}
                            </p>
                        </div>
                        <div className="bg-white/5 p-3 rounded clip-corner-sm border border-white/5">
                            <p className="text-[8px] text-gray-500 uppercase font-bold tracking-widest">Start Time</p>
                            <p className="text-sm font-bold text-white mt-1 uppercase font-mono">{tournament.startTime}</p>
                        </div>
                        <div className="bg-white/5 p-3 rounded clip-corner-sm border border-white/5">
                            <p className="text-[8px] text-gray-500 uppercase font-bold tracking-widest">Slots</p>
                            <p className="text-xl font-bold text-gaming-accent">{tournament.filledSlots}/{tournament.slots}</p>
                        </div>
                        {tournament.category === 'Solo' && tournament.perKillCommission && tournament.perKillCommission > 0 && (
                            <div className="bg-white/5 p-3 rounded border border-white/5 col-span-2 md:col-span-1">
                                <p className="text-xs text-gray-500 uppercase font-bold">Per Kill</p>
                                <p className="text-xl font-bold text-green-400">৳{(tournament.perKillCommission || 0).toLocaleString()}</p>
                            </div>
                        )}
                    </div>

                    {/* Rules Section */}
                    <div>
                        <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2 uppercase tracking-widest">
                            <Shield size={16} className="text-gaming-accent" /> Rules & Regulations
                        </h3>
                        <div className="bg-white/5 p-4 rounded border border-white/5 text-sm text-gray-400 whitespace-pre-wrap">
                            {tournament.rules || (
                                <ul className="space-y-2">
                                    <li className="flex items-start gap-2"><span className="text-gaming-accent mt-1">•</span> Emulators are strictly prohibited. Mobile devices only.</li>
                                    <li className="flex items-start gap-2"><span className="text-gaming-accent mt-1">•</span> Teaming up with other squads will result in immediate disqualification.</li>
                                    <li className="flex items-start gap-2"><span className="text-gaming-accent mt-1">•</span> Hacks, scripts, or any third-party tools are forbidden.</li>
                                </ul>
                            )}
                        </div>
                    </div>

                    {/* Group Schedules */}
                    {tournament.groups && tournament.groups.length > 0 && (
                        <div className="bg-black/40 p-4 rounded-lg border border-white/5 space-y-3 mb-6">
                            <h3 className="text-white font-bold flex items-center gap-2">
                                <Calendar size={18} className="text-blue-500" /> Group Schedules
                            </h3>

                            {/* User's Specific Group */}
                            {user && (() => {
                                const participant = tournament.participants?.find(p => p.id === user.id || (user.teamId && p.id === user.teamId));
                                if (participant && participant.groupId) {
                                    const myGroup = tournament.groups.find(g => g.id === participant.groupId);
                                    if (myGroup) {
                                        return (
                                            <div className="bg-blue-500/10 border border-blue-500/30 p-3 rounded mb-4">
                                                <p className="text-blue-400 text-xs uppercase font-bold mb-1">Your Match Schedule</p>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-white font-bold text-lg">{myGroup.name}</span>
                                                    <span className="text-white font-mono text-sm bg-black/60 px-2 py-1 rounded">
                                                        {myGroup.schedule ? new Date(myGroup.schedule).toLocaleString() : 'TBA'}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    }
                                }
                                return null;
                            })()}

                            {/* All Groups List */}
                            <div className="grid grid-cols-2 text-xs gap-2">
                                {tournament.groups.map(g => (
                                    <div key={g.id} className="flex justify-between items-center p-2 bg-white/5 rounded">
                                        <span className="text-gray-400 font-bold">{g.name}</span>
                                        <span className="text-white">{g.schedule ? new Date(g.schedule).toLocaleString() : 'TBA'}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Roadmap Section (Big Match) */}
                    {tournament.roadmap && (
                        <div>
                            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                                <Map size={18} className="text-gaming-primary" /> Tournament Roadmap
                            </h3>
                            <div className="bg-white/5 p-4 rounded border border-white/5">
                                <img src={tournament.roadmap} alt="Roadmap" className="w-full rounded border border-white/10" />
                            </div>
                        </div>
                    )}

                    {/* Team Selection (For Squad/Duo) */}
                    {tournament.category !== 'Solo' && user && (
                        <div>
                            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                                <Users size={18} className="text-gaming-primary" /> Select Lineup
                            </h3>
                            {!userTeam ? (
                                <div className="bg-red-500/10 p-4 rounded border border-red-500/20 text-red-400 text-sm">
                                    You must be part of a Squad to join this tournament.
                                </div>
                            ) : userTeam.captainId !== user.id ? (
                                <div className="bg-gaming-accent/10 p-4 rounded border border-gaming-accent/20 text-gaming-accent text-sm">
                                    Only the Team Captain can register the squad.
                                </div>
                            ) : (
                                <div className="bg-white/5 p-4 rounded border border-white/5 space-y-2">
                                    <p className="text-xs text-gray-500 mb-2 uppercase font-bold">Select {tournament.category === 'Duo' ? '2' : '4'} Players</p>
                                    {userTeam.members.map((member: any) => (
                                        <div key={member.id}
                                            onClick={() => toggleMember(member.id)}
                                            className={`flex items-center justify-between p-3 rounded cursor-pointer border transition-all ${selectedMembers.includes(member.id) ? 'bg-gaming-accent/10 border-gaming-accent shadow-[0_0_10px_rgba(0,223,130,0.2)]' : 'bg-black/40 border-white/5 hover:bg-white/10'}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedMembers.includes(member.id) ? 'border-gaming-accent bg-gaming-accent' : 'border-gray-500'}`}>
                                                    {selectedMembers.includes(member.id) && <CheckCircle size={10} className="text-black" />}
                                                </div>
                                                <span className="text-sm font-bold text-white">{member.ign}</span>
                                                <span className="text-[10px] text-gray-500 uppercase bg-white/5 px-1.5 rounded">{member.role}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Participants / Slots Visualization */}
                    <div className="mb-6">
                        <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2 uppercase tracking-widest">
                            <Users size={16} className="text-gaming-accent" /> Participants
                        </h3>
                        <div className="bg-white/5 border border-white/5 rounded-lg p-4">
                            <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                                {Array.from({ length: tournament.slots }).map((_, index) => {
                                    const participant = tournament.participants?.[index];
                                    const finalAvatar = participant?.avatar || `https://ui-avatars.com/api/?name=${participant?.name || 'User'}&background=random`;

                                    return (
                                        <button
                                            key={index}
                                            onClick={() => participant && setViewProfileId(participant.id)}
                                            disabled={!participant}
                                            className={`aspect-square rounded border flex flex-col items-center justify-center p-1 relative overflow-hidden transition-all ${participant ? 'bg-gaming-accent/10 border-gaming-accent/30 hover:bg-gaming-accent/20 hover:border-gaming-accent/50 cursor-pointer shadow-[0_0_10px_rgba(0,223,130,0.1)]' : 'bg-black/40 border-white/5 cursor-default'}`}
                                        >
                                            {participant ? (
                                                <>
                                                    <div className="w-10 h-10 rounded-full bg-black border-2 border-gaming-accent/50 mb-1.5 overflow-hidden shadow-[0_0_10px_rgba(0,223,130,0.3)]">
                                                        <img src={finalAvatar} alt={participant.name} className="w-full h-full object-cover" />
                                                    </div>
                                                    <span className="text-[9px] font-bold text-white truncate w-full text-center leading-none">{participant.name}</span>
                                                    <div className="absolute top-0 right-0 bg-gaming-accent text-black text-[7px] font-bold px-1.5 py-0.5 rounded-bl-sm">#{index + 1}</div>
                                                </>
                                            ) : (
                                                <>
                                                    <span className="text-[8px] text-gray-600 font-bold mb-1">OPEN</span>
                                                    <div className="absolute top-0 right-0 bg-gray-800 text-gray-500 text-[6px] font-bold px-1 rounded-bl-sm">#{index + 1}</div>
                                                </>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Match Credentials Section */}
                    {user && (() => {
                        const participant = tournament.participants?.find(p => p.id === user.id || (user.teamId && p.id === user.teamId));

                        if (!participant) return null;

                        // Check specific group credentials first
                        if (participant.groupId && tournament.groups) {
                            const group = tournament.groups.find(g => g.id === participant.groupId);
                            if (group && group.credentialsPublished) {
                                return (
                                    <div className="bg-gaming-accent/10 border border-gaming-accent p-4 rounded-lg mb-4 animate-pulse-slow">
                                        <h3 className="text-gaming-accent font-bold text-lg mb-2 flex items-center gap-2">
                                            <Shield size={20} /> Match Credentials (Group {group.name})
                                        </h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-black/40 p-3 rounded border border-gaming-accent/30">
                                                <span className="block text-xs text-gray-400 uppercase font-bold">Room ID</span>
                                                <span className="block text-xl text-white font-mono font-bold tracking-widest">{group.roomId}</span>
                                            </div>
                                            <div className="bg-black/40 p-3 rounded border border-gaming-accent/30">
                                                <span className="block text-xs text-gray-400 uppercase font-bold">Password</span>
                                                <span className="block text-xl text-white font-mono font-bold tracking-widest">{group.roomPassword}</span>
                                            </div>
                                        </div>
                                        <p className="text-[10px] text-gaming-accent mt-2 text-center font-bold uppercase">
                                            Do not share these credentials with anyone outside your team.
                                        </p>
                                    </div>
                                );
                            }
                        }

                        // Fallback to Global Credentials
                        if (tournament.credentialsPublished) {
                            return (
                                <div className="bg-gaming-accent/10 border border-gaming-accent p-4 rounded-lg mb-4 animate-pulse-slow">
                                    <h3 className="text-gaming-accent font-bold text-lg mb-2 flex items-center gap-2">
                                        <Shield size={20} /> Match Credentials
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-black/40 p-3 rounded border border-gaming-accent/30">
                                            <span className="block text-xs text-gray-400 uppercase font-bold">Room ID</span>
                                            <span className="block text-xl text-white font-mono font-bold tracking-widest">{tournament.roomId}</span>
                                        </div>
                                        <div className="bg-black/40 p-3 rounded border border-gaming-accent/30">
                                            <span className="block text-xs text-gray-400 uppercase font-bold">Password</span>
                                            <span className="block text-xl text-white font-mono font-bold tracking-widest">{tournament.roomPassword}</span>
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-gaming-accent mt-2 text-center font-bold uppercase">
                                        Do not share these credentials with anyone outside your team.
                                    </p>
                                </div>
                            );
                        }

                        return null;
                    })()}

                    {/* Action Area */}
                    <div className="pt-4 border-t border-white/10">
                        {bookingStatus === 'SUCCESS' ? (
                            <div className="bg-green-500/20 border border-green-500/50 p-4 rounded text-center">
                                <CheckCircle size={32} className="text-green-500 mx-auto mb-2" />
                                <h4 className="text-green-400 font-bold text-lg">Slot Booked Successfully!</h4>
                                <p className="text-gray-300 text-sm mt-1">Get ready for the battle. Check your email for room details.</p>
                            </div>
                        ) : (
                            <>
                                {bookingStatus === 'ERROR' && (
                                    <div className="bg-red-500/20 border border-red-500/50 p-3 rounded mb-4 flex items-center gap-2 text-red-400 text-sm">
                                        <AlertTriangle size={16} />
                                        {message}
                                    </div>
                                )}
                                <button
                                    onClick={handleBookSlot}
                                    disabled={isBooking || tournament.filledSlots >= tournament.slots || (tournament.isPremium && !(user?.membership?.expiresAt && new Date(user.membership.expiresAt) > new Date()))}
                                    className={`w-full py-4 rounded-lg font-black uppercase tracking-[0.2em] text-lg transition-all ${isBooking ? 'bg-gray-600 cursor-wait' :
                                        tournament.filledSlots >= tournament.slots ? 'bg-gray-800 text-gray-500 cursor-not-allowed' :
                                            (tournament.isPremium && !(user?.membership?.expiresAt && new Date(user.membership.expiresAt) > new Date())) ? 'bg-red-900/50 text-red-500 border border-red-500/30 font-bold' :
                                                'bg-gaming-accent hover:bg-gaming-accent/90 text-black shadow-[0_0_20px_rgba(0,223,130,0.3)]'
                                        }`}
                                >
                                    {isBooking ? 'Processing...' :
                                        tournament.filledSlots >= tournament.slots ? 'Slots Full' :
                                            (tournament.isPremium && !(user?.membership?.expiresAt && new Date(user.membership.expiresAt) > new Date())) ? 'Sub Req.' : 'Confirm Slot Booking'}
                                </button>
                                <p className="text-center text-[10px] text-gray-500 mt-2 uppercase font-bold tracking-tighter opacity-50">
                                    No refunds for DQ. Subscription must be active at match start.
                                </p>
                            </>
                        )}
                    </div>
                </div>
            </div>
            {viewProfileId && (
                <PublicProfileModal userId={viewProfileId} onClose={() => setViewProfileId(null)} />
            )}
        </div>
    );
};

export default TournamentDetailsModal;
