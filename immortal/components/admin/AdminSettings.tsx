import React, { useState, useEffect } from 'react';
import { Save, Globe, MessageSquare, Youtube, Facebook, Send, Ghost, ShieldAlert } from 'lucide-react';

const AdminSettings: React.FC = () => {
    const [socialLinks, setSocialLinks] = useState({
        whatsapp: '',
        telegram: '',
        youtube: '',
        facebook: '',
        discord: '',
        twitter: ''
    });
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            const res = await fetch(`${baseUrl}/settings`);
            const data = await res.json();
            if (data.success && data.settings.social_links) {
                setSocialLinks(data.settings.social_links);
            }
        } catch (error) {
            console.error('Failed to fetch settings');
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            const res = await fetch(`${baseUrl}/settings/update`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key: 'social_links', value: socialLinks })
            });
            const data = await res.json();
            if (data.success) {
                setMessage('Settings updated successfully');
                setTimeout(() => setMessage(''), 3000);
            }
        } catch (error) {
            setMessage('Failed to update settings');
        } finally {
            setIsSaving(false);
        }
    };

    const SocialInput = ({ label, icon: Icon, value, onChange, placeholder }: any) => (
        <div className="bg-[#12121a] border border-white/5 p-4 rounded-xl space-y-2 group hover:border-gaming-accent/30 transition-all">
            <div className="flex items-center gap-2 text-gray-400 group-hover:text-gaming-accent transition-colors">
                <Icon size={16} />
                <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
            </div>
            <input
                type="text"
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-gaming-accent outline-none transition-all font-mono"
            />
        </div>
    );

    return (
        <div className="space-y-6 animate-fade-in text-white">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-black italic uppercase tracking-tighter flex items-center gap-3">
                        <Globe className="text-gaming-accent" /> Global Settings
                    </h2>
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-widest mt-1">Management of Social Assets & API Configs</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-gaming-accent text-black px-6 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-gaming-accent/90 transition-all shadow-lg shadow-gaming-accent/20 active:scale-95 disabled:opacity-50"
                >
                    <Save size={16} /> {isSaving ? 'Saving...' : 'Save Configuration'}
                </button>
            </div>

            {message && (
                <div className={`p-4 rounded-lg flex items-center gap-2 text-sm font-bold uppercase ${message.includes('success') ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                    <ShieldAlert size={18} /> {message}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <SocialInput
                    label="WhatsApp Support"
                    icon={MessageSquare}
                    value={socialLinks.whatsapp}
                    onChange={(v: string) => setSocialLinks({ ...socialLinks, whatsapp: v })}
                    placeholder="https://wa.me/..."
                />
                <SocialInput
                    label="Telegram Channel"
                    icon={Send}
                    value={socialLinks.telegram}
                    onChange={(v: string) => setSocialLinks({ ...socialLinks, telegram: v })}
                    placeholder="https://t.me/..."
                />
                <SocialInput
                    label="YouTube Channel"
                    icon={Youtube}
                    value={socialLinks.youtube}
                    onChange={(v: string) => setSocialLinks({ ...socialLinks, youtube: v })}
                    placeholder="https://youtube.com/@..."
                />
                <SocialInput
                    label="Facebook Page"
                    icon={Facebook}
                    value={socialLinks.facebook}
                    onChange={(v: string) => setSocialLinks({ ...socialLinks, facebook: v })}
                    placeholder="https://facebook.com/..."
                />
                <SocialInput
                    label="Discord Server"
                    icon={Ghost}
                    value={socialLinks.discord}
                    onChange={(v: string) => setSocialLinks({ ...socialLinks, discord: v })}
                    placeholder="https://discord.gg/..."
                />
                <SocialInput
                    label="Twitter (X)"
                    icon={Globe}
                    value={socialLinks.twitter}
                    onChange={(v: string) => setSocialLinks({ ...socialLinks, twitter: v })}
                    placeholder="https://twitter.com/..."
                />
            </div>
        </div>
    );
};

export default AdminSettings;
