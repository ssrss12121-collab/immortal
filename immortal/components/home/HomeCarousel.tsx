import React, { useState, useEffect } from 'react';
import { Tournament } from '../../types';

interface Banner {
    id: string;
    image: string;
    title: string;
    description: string;
    videoUrl?: string;
    badgeText?: string;
}

type SlideItem =
    | { type: 'BANNER'; data: Banner }
    | { type: 'TOURNAMENT'; data: Tournament };

interface Props {
    slides: SlideItem[];
    onSlideClick: (slide: SlideItem) => void;
}

const getYoutubeId = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
};

const HomeCarousel: React.FC<Props> = ({ slides, onSlideClick }) => {
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        if (slides.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [slides.length]);

    if (slides.length === 0) {
        return (
            <div className="w-full h-52 bg-[#12121a] border border-white/10 clip-corner flex items-center justify-center">
                <p className="text-gray-500 text-xs font-mono tracking-widest">NO ACTIVE FEEDS</p>
            </div>
        );
    }

    return (
        <div className="relative w-full h-52 clip-corner overflow-hidden group cursor-pointer cyber-border-green cyber-glimmer" onClick={() => onSlideClick(slides[currentSlide])}>
            {slides.map((slide, index) => (
                <div
                    key={slide.data.id || index}
                    className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'} `}
                >
                    <div className="absolute inset-0 bg-gaming-primary/10 group-hover:bg-gaming-primary/20 transition-colors z-10"></div>
                    {slide.data.videoUrl ? (
                        (() => {
                            const ytId = getYoutubeId(slide.data.videoUrl!);
                            return ytId ? (
                                <div className="w-full h-full relative pointer-events-none overflow-hidden bg-black">
                                    <iframe
                                        className="w-full h-[180%] -top-[40%] absolute object-cover opacity-80"
                                        src={`https://www.youtube.com/embed/${ytId}?autoplay=1&mute=1&controls=0&showinfo=0&rel=0&loop=1&playlist=${ytId}&modestbranding=1&iv_load_policy=3&disablekb=1&enablejsapi=1&origin=${window.location.origin}`}
                                        title="Banner Video"
                                        allow="autoplay; encrypted-media"
                                        style={{ pointerEvents: 'none' }}
                                    />
                                    <div className="absolute inset-0 bg-black/20 z-10"></div>
                                </div>
                            ) : (
                                <video
                                    src={slide.data.videoUrl}
                                    className="w-full h-full object-cover"
                                    autoPlay
                                    muted
                                    loop
                                    playsInline
                                />
                            );
                        })()
                    ) : (
                        <img src={slide.data.image} alt="Slide" className="w-full h-full object-cover" />
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent flex flex-col justify-end p-5 z-30">
                        <div className="flex items-center space-x-2 mb-2">
                            <div className="px-2 py-0.5 clip-corner-sm cyber-tag-green uppercase font-bold tracking-widest text-[9px]">
                                {slide.type === 'TOURNAMENT' ? 'Major Event' : (slide.data.badgeText || 'Featured')}
                            </div>
                        </div>
                        <h2 className="text-3xl font-black italic text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] leading-none mb-2 uppercase tracking-tighter transition-all group-hover:tracking-normal">
                            {slide.data.title}
                        </h2>
                        <div className="flex items-center space-x-3 text-xs font-mono text-gray-300">
                            {slide.type === 'TOURNAMENT' ? (
                                <>
                                    <span className="bg-black/50 px-2 py-1 rounded-sm border border-gaming-accent/30">Prize: <span className="text-gaming-accent font-bold">৳{slide.data.prizePool}</span></span>
                                    <span className="text-gray-400 uppercase tracking-widest text-[10px]">{slide.data.category} MODE</span>
                                </>
                            ) : (
                                <p className="text-[10px] text-gray-400 italic line-clamp-1">{slide.data.description}</p>
                            )}
                        </div>
                    </div>
                </div>
            ))}
            <div className="absolute bottom-3 left-6 z-40 flex space-x-1.5">
                {slides.map((_, idx) => (
                    <div
                        key={idx}
                        className={`h-1 transition-all duration-500 ${idx === currentSlide ? 'w-8 bg-gaming-accent' : 'w-2 bg-white/20'}`}
                        onClick={(e) => { e.stopPropagation(); setCurrentSlide(idx); }}
                    />
                ))}
            </div>
        </div>
    );
};

export default React.memo(HomeCarousel);
