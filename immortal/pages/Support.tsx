import React, { useState, useEffect } from 'react';
import { ChevronLeft, Mail, MessageSquare, Globe, Youtube, Facebook, Send, Ghost, Zap } from 'lucide-react';

interface SupportProps {
    onBack: () => void;
}

const Support: React.FC<SupportProps> = ({ onBack }) => {
    const [socialLinks, setSocialLinks] = useState<any>(null);

    useEffect(() => {
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        fetch(`${baseUrl}/settings`)
            .then(res => res.json())
            .then(data => {
                if (data.success && data.settings.social_links) {
                    setSocialLinks(data.settings.social_links);
                }
            })
            .catch(err => console.error('Failed to load social links'));
    }, []);

    const SocialLink = ({ icon: Icon, title, desc, url, color }: any) => {
        if (!url) return null;
        return (
            <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between bg-[#0c0c12]/60 p-4 clip-corner-sm border border-white/5 hover:bg-[#1a1a24] group transition-all">
                <div className="flex items-center gap-3">
                    <Icon size={18} className={color} />
                    <div>
                        <p className="text-xs font-bold text-white uppercase">{title}</p>
                        <p className="text-[10px] text-gray-500">{desc}</p>
                    </div>
                </div>
                <ChevronLeft size={16} className="rotate-180 text-gray-600 group-hover:text-gaming-accent transition-colors" />
            </a>
        );
    };

    return (
        <div className="pb-28 pt-6 px-4 animate-fade-in">
            {/* Header */}
            <div className="flex items-center space-x-2 mb-8 cursor-pointer" onClick={onBack}>
                <div className="p-1.5 bg-white/10 rounded hover:bg-white/20 transition-colors"><ChevronLeft size={18} /></div>
                <h1 className="text-xl font-black uppercase italic tracking-wider text-white">Support <span className="text-gray-500">Center</span></h1>
            </div>

            <div className="space-y-6">
                <div className="bg-[#1a1a24] p-6 clip-corner-sm border border-white/5 text-center">
                    <h2 className="text-lg font-bold text-white mb-2 italic uppercase tracking-tight">Need Assistance?</h2>
                    <p className="text-gray-400 text-[10px] mb-6 uppercase tracking-widest font-bold">Our support team is available 10:00 AM - 10:00 PM</p>

                    <a href="mailto:support@immoral.zone" className="block w-full py-4 bg-gaming-accent text-black font-black uppercase tracking-widest text-[10px] clip-corner-sm hover:scale-[1.02] transition-transform mb-3 shadow-[0_0_20px_rgba(0,223,130,0.2)]">
                        <div className="flex items-center justify-center gap-2">
                            <Mail size={16} /> Contact via Email
                        </div>
                    </a>

                    <div className="py-2 flex items-center gap-2 justify-center opacity-50">
                        <div className="h-[1px] flex-1 bg-white/10"></div>
                        <span className="text-[9px] font-black uppercase tracking-widest text-gray-500">OR JOIN TELEGRAM</span>
                        <div className="h-[1px] flex-1 bg-white/10"></div>
                    </div>
                </div>

                <div className="space-y-3">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gaming-accent ml-1 mb-4 flex items-center gap-2">
                        <Zap size={10} /> COMM CENTERS (LIVE)
                    </h3>

                    {socialLinks ? (
                        <div className="grid grid-cols-1 gap-3">
                            <SocialLink icon={MessageSquare} title="WhatsApp" desc="Direct support chat" url={socialLinks.whatsapp} color="text-green-500" />
                            <SocialLink icon={Send} title="Telegram" desc="Official channel & community" url={socialLinks.telegram} color="text-blue-400" />
                            <SocialLink icon={Youtube} title="YouTube" desc="Watch highlights & streams" url={socialLinks.youtube} color="text-red-500" />
                            <SocialLink icon={Facebook} title="Facebook" desc="Follow for news" url={socialLinks.facebook} color="text-blue-600" />
                            <SocialLink icon={Ghost} title="Discord" desc="Join the community server" url={socialLinks.discord} color="text-indigo-500" />
                            <SocialLink icon={Globe} title="Twitter (X)" desc="Stay updated" url={socialLinks.twitter} color="text-gray-400" />
                        </div>
                    ) : (
                        <div className="animate-pulse space-y-3">
                            <div className="h-14 bg-white/5 rounded-lg"></div>
                            <div className="h-14 bg-white/5 rounded-lg"></div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Support;
