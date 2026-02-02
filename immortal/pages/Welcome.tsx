import React, { useState, useEffect } from 'react';
import { ChevronRight, Shield, Trophy, Users, Zap, Target, Crosshair } from 'lucide-react';

interface WelcomeProps {
    onComplete: () => void;
}

const slides = [
    {
        id: 1,
        title: "ENTER THE ARENA",
        subtitle: "PROVE YOUR SUPREMACY",
        description: "Join the ultimate eSports ecosystem. Compete in high-stakes tournaments where every kill counts.",
        icon: Trophy,
        accent: "text-yellow-400",
        border: "border-yellow-400/50",
        shadow: "shadow-yellow-400/20",
        bgValues: "from-yellow-900/40 via-black to-black"
    },
    {
        id: 2,
        title: "ASSEMBLE SQUAD",
        subtitle: "TACTICAL DOMINANCE",
        description: "Form alliances, recruit operatives, and execute coordinated strikes. Your team is your weapon.",
        icon: Users,
        accent: "text-cyan-400",
        border: "border-cyan-400/50",
        shadow: "shadow-cyan-400/20",
        bgValues: "from-cyan-900/40 via-black to-black"
    },
    {
        id: 3,
        title: "CLAIM BOUNTIES",
        subtitle: "GET PAID TO PLAY",
        description: "Convert your skills into real rewards. Climb the ranks to become an Immortal Legend.",
        icon: Target,
        accent: "text-gaming-accent",
        border: "border-gaming-accent/50",
        shadow: "shadow-[rgba(0,255,157,0.2)]",
        bgValues: "from-gaming-accent/20 via-black to-black"
    }
];

import welcomeBg from '../assets/welcome_bg.png';

const Welcome: React.FC<WelcomeProps> = ({ onComplete }) => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);

    const handleNext = () => {
        if (isAnimating) return;
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 500);

        if (currentSlide < slides.length - 1) {
            setCurrentSlide(prev => prev + 1);
        } else {
            onComplete();
        }
    };

    const handleSkip = () => {
        onComplete();
    };

    // Auto-advance or hints could go here, but manual is better for onboarding

    return (
        <div className="fixed inset-0 z-[100] bg-black text-white flex flex-col font-mono overflow-hidden">
            {/* Dynamic Background */}
            <div className="absolute inset-0 z-0">
                {/* Image Background */}
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40"
                    style={{ backgroundImage: `url(${welcomeBg})` }}
                ></div>

                {/* Cyber Grid */}
                <div className="absolute inset-0 cyber-grid-bg opacity-20 mix-blend-overlay"></div>

                {/* Radial Gradient based on slide */}
                <div className={`absolute inset-0 bg-gradient-to-br ${slides[currentSlide].bgValues} mix-blend-multiply transition-colors duration-1000 ease-in-out`}></div>

                {/* Scanline Effect */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-[1] bg-[length:100%_2px,3px_100%] pointer-events-none"></div>
            </div>

            {/* Top HUD */}
            <div className="relative z-20 flex justify-between items-center p-6 pt-8">
                <div className="flex items-center space-x-2">
                    <div className={`h-2 w-2 rounded-full ${slides[currentSlide].accent} animate-pulse shadow-[0_0_10px_currentColor]`}></div>
                    <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/70">System_Init_v2.0</span>
                </div>
                <button
                    onClick={handleSkip}
                    className="text-[10px] font-black uppercase tracking-widest text-white/50 hover:text-white transition-colors border border-white/10 px-3 py-1 clip-corner-sm hover:border-white/50"
                >
                    Skip_Seq
                </button>
            </div>

            {/* Main Content */}
            <div className="relative z-10 flex-1 flex flex-col justify-center items-center px-6 pb-20">
                {slides.map((slide, idx) => (
                    <div
                        key={slide.id}
                        className={`absolute inset-0 flex flex-col justify-center items-center transition-all duration-700 w-full px-6 ${idx === currentSlide
                            ? 'opacity-100 translate-x-0 blur-0 scale-100'
                            : idx < currentSlide
                                ? 'opacity-0 -translate-x-[100px] blur-sm scale-90'
                                : 'opacity-0 translate-x-[100px] blur-sm scale-90'
                            }`}
                        style={{ pointerEvents: idx === currentSlide ? 'auto' : 'none' }}
                    >
                        {/* Central Icon/Graphic */}
                        <div className="mb-12 relative group w-64 h-64 flex items-center justify-center">
                            {/* Rotating Rings */}
                            <div className={`absolute inset-0 border-2 ${slide.border} rounded-full opacity-20 w-full h-full animate-[spin_10s_linear_infinite]`}></div>
                            <div className={`absolute inset-4 border border-white/10 rounded-full w-[calc(100%-32px)] h-[calc(100%-32px)] animate-[spin_15s_linear_infinite_reverse]`}></div>

                            {/* Glowing Core */}
                            <div className={`absolute inset-0 ${slide.accent} blur-[100px] opacity-20`}></div>

                            {/* Icon */}
                            <slide.icon
                                size={80}
                                className={`${slide.accent} drop-shadow-[0_0_20px_rgba(255,255,255,0.3)] relative z-10`}
                            />

                            {/* Data Decoration */}
                            <div className="absolute -right-4 top-1/2 -translate-y-1/2 flex flex-col space-y-2">
                                <div className="w-1 h-1 bg-white/50"></div>
                                <div className="w-1 h-1 bg-white/50"></div>
                                <div className="w-1 h-1 bg-white/50"></div>
                            </div>
                        </div>

                        {/* Text Content */}
                        <div className="text-center space-y-4 max-w-sm mx-auto">
                            <h2 className="text-4xl font-black italic uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50 drop-shadow-xl glitch-text" data-text={slide.title}>
                                {slide.title}
                            </h2>
                            <div className="h-0.5 w-24 mx-auto bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
                            <p className={`text-xs font-bold uppercase tracking-[0.3em] ${slide.accent}`}>
                                {slide.subtitle}
                            </p>
                            <p className="text-sm text-gray-400 font-medium leading-relaxed">
                                {slide.description}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Bottom Controls */}
            <div className="relative z-20 px-6 pb-8">
                {/* Progress Indicators */}
                <div className="flex justify-center space-x-3 mb-8">
                    {slides.map((_, idx) => (
                        <div
                            key={idx}
                            className={`h-1 transition-all duration-500 rounded-full ${idx === currentSlide
                                ? `w-12 ${slides[currentSlide].accent.replace('text-', 'bg-')} shadow-[0_0_10px_currentColor]`
                                : 'w-2 bg-white/10'
                                }`}
                        ></div>
                    ))}
                </div>

                <button
                    onClick={handleNext}
                    className="w-full relative group overflow-hidden bg-white text-black font-black py-5 clip-corner-sm uppercase tracking-[0.2em] text-sm hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                >
                    <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-r ${slides[currentSlide].bgValues}`}></div>
                    <span className="relative z-10 flex items-center justify-center space-x-2">
                        <span>{currentSlide === slides.length - 1 ? 'Deploy Operator' : 'Next Protocol'}</span>
                        <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </span>

                    {/* Button Corner Accents */}
                    <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-black opacity-20"></div>
                    <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-black opacity-20"></div>
                </button>
            </div>
        </div>
    );
};

export default Welcome;
