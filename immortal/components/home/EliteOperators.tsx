import React from 'react';
import { Star } from 'lucide-react';
import { UserProfile } from '../../types';

interface Props {
    players: UserProfile[];
    onViewProfile: (id: string) => void;
}

const EliteOperators: React.FC<Props> = ({ players, onViewProfile }) => (
    <div className="mt-8">
        <div className="flex justify-between items-center mb-4 px-1 border-b border-white/5 pb-2">
            <h3 className="text-lg font-black uppercase italic tracking-wider text-white flex items-center">
                <Star className="text-gaming-accent mr-2" size={18} />
                Elite Operators
            </h3>
        </div>
        <div className="grid grid-cols-1 gap-4">
            {players.map(player => (
                <div
                    key={player.id}
                    onClick={() => onViewProfile(player.id)}
                    className="bg-[#0c0c12]/80 backdrop-blur border border-white/5 p-4 clip-corner-sm hover:border-gaming-accent/40 transition-all cursor-pointer group relative overflow-hidden cyber-border-green"
                >
                    <div className="flex items-start gap-5">
                        <div className="w-16 h-16 clip-corner-sm bg-black/80 border border-white/10 overflow-hidden shrink-0 group-hover:border-gaming-accent/50 transition-colors">
                            <img src={player.avatarUrl || `https://ui-avatars.com/api/?name=${player.ign}&background=random`} alt={player.ign} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="text-white font-black italic uppercase tracking-wider text-xl leading-none group-hover:text-gaming-accent transition-colors">{player.ign}</h4>
                                    <p className="text-[10px] text-gray-500 font-mono mt-1 opacity-70">OPERATOR ID: {player.id}</p>
                                </div>
                                <div className="cyber-tag-green px-2 py-0.5 clip-corner-sm">
                                    <span className="text-[9px] font-black uppercase tracking-[0.1em]">{player.role}</span>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-3 mt-4">
                                <div className="bg-black/60 p-2 rounded-sm border-b-2 border-gaming-accent/30 text-center transition-all group-hover:border-gaming-accent">
                                    <p className="text-gaming-accent font-black font-mono text-base leading-none">{player.stats.kills}</p>
                                    <p className="text-[8px] text-gray-600 uppercase font-black tracking-widest mt-1">Kills</p>
                                </div>
                                <div className="bg-black/60 p-2 rounded-sm border-b-2 border-white/10 text-center transition-all group-hover:border-white/40">
                                    <p className="text-white font-black font-mono text-base leading-none">{player.stats.matches}</p>
                                    <p className="text-[8px] text-gray-600 uppercase font-black tracking-widest mt-1">Ops</p>
                                </div>
                                <div className="bg-black/60 p-2 rounded-sm border-b-2 border-blue-500/30 text-center transition-all group-hover:border-blue-500">
                                    <p className="text-blue-400 font-black font-mono text-base leading-none">{player.stats.wins}</p>
                                    <p className="text-[8px] text-gray-600 uppercase font-black tracking-widest mt-1">Wins</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

export default React.memo(EliteOperators);
