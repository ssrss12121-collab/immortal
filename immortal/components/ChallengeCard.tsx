import React from 'react';
import { Challenge } from '../types';
import { Crosshair, Shield, Zap, Swords } from 'lucide-react';

interface Props {
    challenge: Challenge;
    onAccept: () => void;
}

const ChallengeCard: React.FC<Props> = ({ challenge, onAccept }) => (
    <div className="bg-[#0c0c12]/90 backdrop-blur clip-corner border border-white/5 relative group hover:border-gaming-accent/40 transition-all overflow-hidden cyber-border-green cyber-glimmer">
        <div className="absolute top-0 right-0 w-24 h-full bg-gradient-to-l from-gaming-accent/10 to-transparent skew-x-12"></div>
        <div className="absolute -left-1 top-0 bottom-0 w-1 bg-gaming-accent/50 group-hover:bg-gaming-accent transition-all"></div>

        <div className="p-4 relative z-10">
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 clip-corner-sm relative">
                        <img src={`https://ui-avatars.com/api/?name=${challenge.challengerName}&background=000&color=d00`} className="w-full h-full object-cover clip-corner-sm grayscale group-hover:grayscale-0" />
                        <div className="absolute -bottom-1 -right-1 bg-black border border-white/10 p-0.5 rounded-full">
                            {challenge.type === '1v1' ? <Crosshair size={10} className="text-red-500" /> : <Shield size={10} className="text-blue-500" />}
                        </div>
                    </div>
                    <div>
                        <h4 className="text-sm font-black italic text-white uppercase tracking-tight leading-none">{challenge.challengerName}</h4>
                        <span className="text-[9px] text-gray-500 font-mono uppercase font-bold tracking-widest">{challenge.challengerRole}</span>
                    </div>
                </div>
                <div className="text-right">
                    <div className="flex items-center justify-end space-x-1 text-gaming-accent">
                        <Shield size={12} fill="currentColor" />
                        <span className="text-xs font-black italic text-gaming-accent tracking-tighter uppercase">Ranked</span>
                    </div>
                    <span className="text-[8px] text-gray-500 uppercase font-bold tracking-widest leading-none block mt-0.5">Subscription Match</span>
                </div>
            </div>

            <div className="bg-black/40 p-2 clip-corner-sm border border-white/5 mb-3">
                <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-2">
                        <span className="text-[9px] text-gray-400 uppercase font-bold">{challenge.map}</span>
                        {challenge.targetId && (
                            <span className="text-[8px] bg-red-500/20 text-red-500 px-1.5 py-0.5 rounded-sm font-black uppercase tracking-widest border border-red-500/30">Direct</span>
                        )}
                    </div>
                    {challenge.proposedTime ? (
                        <span className="text-[8px] text-gaming-accent font-bold uppercase tracking-wider">{new Date(challenge.proposedTime).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    ) : (
                        <span className="text-[9px] text-red-400 font-mono">{challenge.time}</span>
                    )}
                </div>
                <p className="text-xs text-gray-300 italic">"{challenge.message}"</p>
            </div>

            {challenge.status === 'Open' ? (
                <button
                    onClick={onAccept}
                    className="w-full bg-white/5 hover:bg-red-600 text-gray-300 hover:text-white border border-white/10 hover:border-transparent py-2 clip-corner-sm text-[10px] font-bold uppercase tracking-[0.2em] transition-all flex items-center justify-center"
                >
                    Accept Duel <Swords size={12} className="ml-2" />
                </button>
            ) : (
                <button disabled className="w-full bg-red-900/20 text-red-500 py-2 clip-corner-sm text-[10px] font-bold uppercase tracking-[0.2em] flex items-center justify-center border border-red-900/30 cursor-not-allowed">
                    {challenge.status}
                </button>
            )}
        </div>
    </div>
);

export default React.memo(ChallengeCard);
