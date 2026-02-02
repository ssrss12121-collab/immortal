import React from 'react';
import { Star, Info } from 'lucide-react';
import { MVPItem } from '../../types';

interface Props {
    mvps: MVPItem[];
    onSelectMVP: (mvp: MVPItem) => void;
}

const MVPSpotlight: React.FC<Props> = ({ mvps, onSelectMVP }) => (
    <div className="animate-slide-in-bottom">
        <div className="flex justify-between items-end mb-4 px-1 border-b border-white/5 pb-2">
            <h3 className="text-lg font-black uppercase italic tracking-wider flex items-center text-white">
                <Star className="text-gaming-accent mr-2 drop-shadow-[0_0_8px_rgba(0,223,130,0.6)]" size={18} />
                MVP Spotlight
            </h3>
        </div>

        <div className="flex space-x-4 overflow-x-auto pb-6 -mx-4 px-4 scrollbar-none scrollbar-hide">
            {mvps.map(mvp => (
                <div
                    key={mvp.id}
                    onClick={() => onSelectMVP(mvp)}
                    className="relative min-w-[320px] h-44 clip-corner-sm overflow-hidden group cursor-pointer border border-white/10 hover:border-gaming-accent/50 transition-all duration-500 hover:shadow-[0_0_25px_rgba(0,223,130,0.15)] cyber-border-green cyber-glimmer"
                >
                    <img src={mvp.image} className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-all duration-700 group-hover:scale-105" alt={mvp.name} />
                    <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent"></div>
                    <div className="absolute top-0 left-0 p-6 h-full flex flex-col justify-center">
                        <div className="cyber-tag-green px-2.5 py-0.5 clip-corner-sm w-fit mb-3">
                            <span className="text-[9px] font-bold uppercase tracking-[0.2em]">Featured Player</span>
                        </div>
                        <h2 className="text-4xl font-black italic text-white uppercase leading-none mb-1 drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)]">{mvp.name}</h2>
                        <p className="text-gray-300 text-[10px] font-bold uppercase tracking-[0.25em] mb-4 flex items-center gap-2">
                            <span className="text-gaming-accent font-black">{mvp.team}</span>
                            <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
                            <span className="opacity-80 font-mono tracking-widest">{mvp.role}</span>
                        </p>
                        <div className="flex gap-4">
                            <div className="text-center bg-black/60 px-4 py-1.5 rounded-sm border-l-2 border-gaming-accent/50 backdrop-blur-md transition-all group-hover:border-gaming-accent">
                                <span className="block text-white font-black text-xl leading-none">{mvp.stats?.kills}</span>
                                <span className="text-[8px] text-gray-500 uppercase font-black tracking-widest">Kills</span>
                            </div>
                            <div className="text-center bg-black/60 px-4 py-1.5 rounded-sm border-l-2 border-white/20 backdrop-blur-md transition-all group-hover:border-white/50">
                                <span className="block text-white font-black text-xl leading-none">{mvp.stats?.wins}</span>
                                <span className="text-[8px] text-gray-500 uppercase font-black tracking-widest">Wins</span>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

export default React.memo(MVPSpotlight);
