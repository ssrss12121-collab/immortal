
import React, { useState, useEffect } from 'react';
import { ChevronRight, ExternalLink, Play } from 'lucide-react';

interface Banner {
    id: string;
    _id?: string;
    image: string;
    title: string;
    description: string;
    videoUrl?: string;
    badgeText?: string;
}

interface DynamicAdCarouselProps {
    ads: Banner[];
    onAdClick: (ad: Banner) => void;
}

const DynamicAdCarousel: React.FC<DynamicAdCarouselProps> = ({ ads, onAdClick }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (ads.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % ads.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [ads.length]);

    if (ads.length === 0) return null;

    const currentAd = ads[currentIndex];

    return (
        <div className="px-4 py-8 animate-fade-in">
            <div className="relative group cursor-pointer" onClick={() => onAdClick(currentAd)}>
                {/* Ad Title Section */}
                <div className="flex items-center justify-between mb-3 px-1">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
                        <span className="text-[10px] font-black uppercase text-blue-500 tracking-[0.2em]">Strategic Relay</span>
                    </div>
                    <div className="flex gap-1.5">
                        {ads.map((_, i) => (
                            <div
                                key={i}
                                className={`h-1 rounded-full transition-all duration-300 ${i === currentIndex ? 'w-4 bg-blue-500' : 'w-1 bg-white/10'}`}
                            ></div>
                        ))}
                    </div>
                </div>

                {/* Ad Frame */}
                <div className="relative h-28 sm:h-36 w-full rounded-2xl overflow-hidden border border-white/5 bg-black/40 group-hover:border-blue-500/30 transition-all shadow-2xl">
                    <img
                        src={currentAd.image}
                        alt={currentAd.title}
                        className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-[3s] ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#0c0c12] via-[#0c0c12]/80 to-transparent"></div>

                    <div className="relative h-full p-5 flex flex-col justify-center max-w-[70%]">
                        <div className="flex items-center gap-2 mb-1.5">
                            <span className="px-1.5 py-0.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[8px] font-black uppercase tracking-tighter rounded">
                                {currentAd.badgeText || 'PROMOTED'}
                            </span>
                            {currentAd.videoUrl && <Play size={10} className="text-blue-500 fill-blue-500" />}
                        </div>
                        <h3 className="text-sm sm:text-lg font-black italic uppercase text-white truncate drop-shadow-lg leading-tight">
                            {currentAd.title}
                        </h3>
                        <p className="text-[10px] sm:text-xs text-gray-500 font-medium line-clamp-1 mt-1 uppercase tracking-tight">
                            {currentAd.description}
                        </p>
                    </div>

                    <div className="absolute right-5 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/5 border border-white/5 rounded-full flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-black transition-all group-active:scale-90">
                        <ChevronRight size={20} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default React.memo(DynamicAdCarousel);
