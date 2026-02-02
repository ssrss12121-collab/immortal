import React from 'react';
import { Flame } from 'lucide-react';
import { NewsItem } from '../../types';

interface Props {
    news: NewsItem[];
}

const IntelFeed: React.FC<Props> = ({ news }) => (
    <div>
        <div className="flex justify-between items-end mb-4 px-1 border-b border-white/5 pb-2">
            <h3 className="text-lg font-black uppercase italic tracking-wider flex items-center text-white">
                <Flame className="text-gaming-secondary mr-2 drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]" size={18} />
                Intel Feed
            </h3>
            <button className="text-[9px] font-bold uppercase tracking-widest text-gray-500 hover:text-white transition-colors">View All &gt;</button>
        </div>

        {news.length > 0 ? (
            <div className="flex space-x-4 overflow-x-auto pb-6 -mx-4 px-4 scrollbar-none scrollbar-hide">
                {news.map(item => (
                    <div key={item.id} className="min-w-[260px] h-40 clip-corner-sm relative overflow-hidden bg-[#12121a] border border-white/10 group hover:border-gaming-accent/40 transition-all duration-300 hover:shadow-[0_0_15px_rgba(0,223,130,0.05)] cyber-glimmer">
                        <img src={item.image} className="w-full h-full object-cover opacity-60 group-hover:opacity-50 transition-all duration-500 group-hover:scale-110" alt="" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                            <span className="text-[8px] px-2 py-0.5 clip-corner-sm mb-2 inline-block uppercase font-bold tracking-widest cyber-tag-green backdrop-blur-sm">
                                {item.type}
                            </span>
                            <p className="text-sm font-bold leading-tight text-white group-hover:text-gaming-accent transition-colors font-sans line-clamp-2">{item.title}</p>
                        </div>
                    </div>
                ))}
            </div>
        ) : (
            <div className="text-center py-8 text-gray-600 text-xs font-mono border border-white/5 rounded bg-white/5">
                NO INTEL AVAILABLE
            </div>
        )}
    </div>
);

export default React.memo(IntelFeed);
