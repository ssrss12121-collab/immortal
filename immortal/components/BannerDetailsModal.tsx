import React, { useState } from 'react';
import { X, Info, Volume2, VolumeX } from 'lucide-react';
import { Banner } from '../utils/bannerStorage';

import { getEmbedUrl } from '../utils/videoUtils';

interface BannerDetailsModalProps {
    banner: Banner;
    onClose: () => void;
}

const BannerDetailsModal: React.FC<BannerDetailsModalProps> = ({ banner, onClose }) => {
    const [isMuted, setIsMuted] = useState(false);
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4 bg-black/90 backdrop-blur-sm animate-in fade-in">
            <div className="bg-[#0c0c12] border-x-0 border-y-0 md:border border-white/10 w-full max-w-3xl h-full md:h-auto md:max-h-[90vh] overflow-y-auto rounded-none md:rounded-lg shadow-2xl relative flex flex-col">

                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 bg-black/50 p-2 rounded-full text-white hover:bg-red-600 transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="relative w-full h-64 md:h-80 shrink-0 bg-black overflow-hidden">
                    {banner.videoUrl ? (
                        banner.videoUrl.match(/(?:youtube\.com|youtu\.be)/) ? (
                            <iframe
                                className="w-full h-[180%] -top-[40%] absolute object-cover"
                                src={`${getEmbedUrl(banner.videoUrl)}?autoplay=1&mute=${isMuted ? 1 : 0}&rel=0&enablejsapi=1&origin=${window.location.origin}`}
                                title={banner.title}
                                allow="autoplay; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        ) : (
                            <video
                                src={banner.videoUrl}
                                className="w-full h-full object-contain"
                                autoPlay
                                muted={isMuted}
                                loop
                                playsInline
                            />
                        )
                    ) : (
                        <img src={banner.image} className="w-full h-full object-cover" alt={banner.title} />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c12] via-transparent to-transparent pointer-events-none"></div>

                    {banner.videoUrl && (
                        <button
                            onClick={() => setIsMuted(!isMuted)}
                            className="absolute bottom-4 right-4 z-20 bg-black/60 p-2 rounded-full text-white hover:bg-gaming-accent hover:text-black transition-colors"
                            title={isMuted ? "Unmute" : "Mute"}
                        >
                            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                        </button>
                    )}
                </div>

                <div className="p-8 space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="bg-gaming-accent text-black text-xs font-bold px-2 py-0.5 rounded uppercase">{banner.badgeText || 'Event Info'}</span>
                    </div>

                    <h2 className="text-3xl md:text-4xl font-black italic text-white uppercase tracking-wide leading-none">
                        {banner.title}
                    </h2>

                    <div className="w-16 h-1 bg-gaming-accent rounded-full my-4"></div>

                    <div className="text-gray-300 leading-relaxed whitespace-pre-wrap font-sans text-lg">
                        {banner.description}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BannerDetailsModal;
