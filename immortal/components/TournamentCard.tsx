import React from 'react';
import { Tournament } from '../types';
import { Users, Clock, Trophy, Zap, ShieldCheck } from 'lucide-react';

interface Props {
    tournament: Tournament;
    onClick: () => void;
    onViewResults: () => void;
    onViewDetails: () => void;
}

const getYoutubeId = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
};

const TournamentCard: React.FC<Props> = ({ tournament, onClick, onViewResults, onViewDetails }) => {
    const isFull = tournament.filledSlots >= tournament.slots;

    return (
        <div onClick={onClick} className="relative group cursor-pointer">
            <div className="absolute -inset-[1px] bg-gradient-to-b from-gaming-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition duration-500 clip-corner"></div>
            <div className="bg-[#0c0c12]/90 backdrop-blur clip-corner border border-white/10 relative overflow-hidden transition-all hover:bg-[#12121a] cyber-border-green cyber-glimmer">
                <div className="h-32 relative pointer-events-none overflow-hidden">
                    {tournament.videoUrl ? (
                        (() => {
                            const ytId = getYoutubeId(tournament.videoUrl);
                            return ytId ? (
                                <div className="w-full h-full relative overflow-hidden bg-black">
                                    <iframe
                                        className="w-full h-[180%] -top-[40%] absolute object-cover opacity-70 group-hover:opacity-90 transition-opacity"
                                        src={`https://www.youtube.com/embed/${ytId}?autoplay=1&mute=1&controls=0&showinfo=0&rel=0&loop=1&playlist=${ytId}&modestbranding=1&iv_load_policy=3&disablekb=1&enablejsapi=1&origin=${window.location.origin}`}
                                        title="Tournament Video"
                                        allow="autoplay; encrypted-media"
                                        style={{ pointerEvents: 'none' }}
                                    />
                                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all z-10"></div>
                                </div>
                            ) : (
                                <video
                                    src={tournament.videoUrl}
                                    className="w-full h-full object-cover opacity-70 group-hover:opacity-90 transition-opacity"
                                    autoPlay
                                    muted
                                    loop
                                    playsInline
                                />
                            );
                        })()
                    ) : (
                        <img src={tournament.image} alt={tournament.title} className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity" />
                    )}
                    <div className="absolute bottom-0 left-0 right-0 h-2/3 bg-gradient-to-t from-[#0c0c12] to-transparent"></div>
                    <div className="absolute top-0 right-0 bg-black/80 backdrop-blur px-3 py-1 clip-corner-sm border-l border-b border-gaming-accent/30 z-10">
                        <span className={`text-[9px] font-bold uppercase tracking-wider flex items-center ${tournament.status === 'Live' ? 'text-red-500 animate-pulse' : 'text-gaming-accent'}`}>
                            {tournament.status === 'Live' && <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-1.5"></span>}
                            {tournament.status}
                        </span>
                    </div>
                </div>

                <div className="p-4 pt-2 space-y-4 relative">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="w-9 h-9 bg-gaming-secondary/10 clip-corner-sm flex items-center justify-center border border-gaming-secondary/20">
                                <Trophy size={16} className="text-gaming-secondary" />
                            </div>
                            <div>
                                <p className="text-[9px] text-gray-500 uppercase font-bold tracking-widest">Prize</p>
                                <p className="font-mono text-lg font-bold text-white text-glow">৳{(tournament.prizePool || 0).toLocaleString()}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            {tournament.isPremium ? (
                                <div className="flex flex-col items-end">
                                    <div className="flex items-center gap-1 bg-gaming-accent/10 border border-gaming-accent/20 px-2 py-0.5 rounded shadow-[0_0_8px_rgba(0,223,130,0.1)]">
                                        <Zap size={10} className="text-gaming-accent fill-gaming-accent" />
                                        <span className="text-[9px] font-black italic text-gaming-accent tracking-tighter uppercase">Premium</span>
                                    </div>
                                    <span className="text-[8px] text-gray-600 font-bold uppercase mt-0.5">Sub Req.</span>
                                </div>
                            ) : (
                                <div className="flex flex-col items-end">
                                    <span className="text-[9px] text-gray-500 uppercase font-black tracking-widest">Entry</span>
                                    <span className="font-black text-lg text-white tracking-widest italic opacity-50">FREE</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex space-x-px bg-white/5 clip-corner-sm border border-white/5">
                        <div className="flex-1 p-2 flex items-center justify-center space-x-2 text-gray-400 border-r border-white/5">
                            <Clock size={12} className="text-gaming-primary" />
                            <span className="text-[10px] font-bold uppercase">{tournament.startTime}</span>
                        </div>
                        <div className="flex-1 p-2 flex items-center justify-center space-x-2 text-gray-400">
                            <Users size={12} className="text-gaming-primary" />
                            <span className="text-[10px] font-bold uppercase">{tournament.filledSlots}/{tournament.slots}</span>
                        </div>
                    </div>

                    {tournament.sponsors && tournament.sponsors.length > 0 && (
                        <div className="flex items-center gap-2 pt-1 pb-1">
                            <span className="text-[8px] text-gray-600 font-black uppercase tracking-widest flex-shrink-0">Partners:</span>
                            <div className="flex -space-x-1.5 overflow-visible">
                                {tournament.sponsors.slice(0, 4).map((s, i) => (
                                    <div key={i} className="w-5 h-5 rounded-full border border-white/20 bg-black/80 p-0.5 flex items-center justify-center overflow-hidden shadow-lg transform hover:scale-110 transition-transform">
                                        <img src={s} alt="Sponsor" className="w-full h-full object-contain" />
                                    </div>
                                ))}
                                {tournament.sponsors.length > 4 && (
                                    <div className="w-5 h-5 rounded-full border border-white/20 bg-black/80 flex items-center justify-center text-[7px] font-black text-gray-500 shadow-lg">
                                        +{tournament.sponsors.length - 4}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="flex gap-2">
                        <button onClick={(e) => { e.stopPropagation(); onViewDetails(); }} className="flex-1 py-3 clip-corner-sm font-bold uppercase text-[10px] bg-blue-500/10 text-blue-500 border border-blue-500/30">Details</button>
                        {tournament.status === 'Completed' ? (
                            <button onClick={(e) => { e.stopPropagation(); onViewResults(); }} className="flex-1 py-3 clip-corner-sm font-bold uppercase text-[10px] bg-gaming-accent/10 text-gaming-accent border border-gaming-accent/30">Results</button>
                        ) : (
                            <button disabled={isFull} className={`flex-1 py-3 clip-corner-sm font-bold uppercase text-[10px] ${isFull ? 'bg-gray-800 text-gray-500' : 'bg-gaming-accent text-black shadow-lg shadow-gaming-accent/20'}`}>
                                {isFull ? 'Full' : 'Join'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default React.memo(TournamentCard);
