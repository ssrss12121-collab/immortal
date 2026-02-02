import React from 'react';
import { Trophy, Skull, Calendar, ChevronRight } from 'lucide-react';

interface MatchHistoryProps {
    history: {
        tournamentId: string;
        tournamentTitle: string;
        position: number;
        kills: number;
        prize: number;
        timestamp: string;
    }[];
}

const MatchHistory: React.FC<MatchHistoryProps> = ({ history }) => {
    if (!history || history.length === 0) {
        return (
            <div className="bg-[#0c0c12]/80 backdrop-blur rounded-lg border border-white/5 p-8 text-center">
                <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-3 opacity-20">
                    <Calendar size={24} className="text-gray-400" />
                </div>
                <p className="text-gray-500 text-xs uppercase font-black tracking-widest leading-relaxed">
                    No Match Archives Found.<br />
                    <span className="text-[10px] opacity-50 font-mono">DEPLOYMENT LOGS EMPTY</span>
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {history.map((match, idx) => (
                <div key={idx} className="bg-[#0c0c12]/90 border-l-2 border border-white/5 rounded-r-lg group hover:border-gaming-accent/30 transition-all p-4 relative overflow-hidden" style={{ borderLeftColor: match.position === 1 ? '#00df82' : match.position <= 3 ? '#94a3b8' : '#334155' }}>
                    {/* Background Glow */}
                    {match.position === 1 && <div className="absolute top-0 right-0 w-24 h-full bg-gradient-to-l from-gaming-accent/5 to-transparent pointer-events-none"></div>}

                    <div className="flex justify-between items-center relative z-10">
                        <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded flex items-center justify-center font-black text-xs ${match.position === 1 ? 'bg-gaming-accent text-black shadow-[0_0_10px_rgba(0,223,130,0.3)]' :
                                match.position <= 3 ? 'bg-gray-400 text-black' : 'bg-white/5 text-gray-500 border border-white/5'
                                }`}>
                                #{match.position}
                            </div>
                            <div>
                                <h4 className="text-white font-black uppercase text-xs tracking-wider group-hover:text-gaming-accent transition-colors">{match.tournamentTitle}</h4>
                                <div className="flex items-center gap-3 mt-1">
                                    <div className="flex items-center gap-1 text-[9px] text-gray-500 font-bold uppercase">
                                        <Calendar size={10} />
                                        {new Date(match.timestamp).toLocaleDateString()}
                                    </div>
                                    <div className="flex items-center gap-1 text-[9px] text-red-500 font-black uppercase">
                                        <Skull size={10} />
                                        {match.kills} Kills
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="text-right">
                            <p className="text-[8px] text-gray-600 uppercase font-black tracking-tighter mb-0.5 leading-none">Earnings</p>
                            <p className={`text-sm font-black font-mono ${match.prize > 0 ? 'text-green-500' : 'text-gray-600'}`}>
                                {match.prize > 0 ? `৳${match.prize}` : '৳0'}
                            </p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default MatchHistory;
