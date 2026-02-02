import React, { useState } from 'react';
import { Plus, Search, MessageSquare, X, Shield, User as UserIcon } from 'lucide-react';
import { getUserById } from '../utils/auth';
import { UserProfile } from '../types';

interface AddFriendByIDProps {
    onStartChat: (userId: string) => void;
}

const AddFriendByID: React.FC<AddFriendByIDProps> = ({ onStartChat }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [playerId, setPlayerId] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<UserProfile | null>(null);
    const [error, setError] = useState('');

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!playerId.trim()) return;

        setLoading(true);
        setError('');
        setResult(null);

        try {
            const user = await getUserById(playerId.trim());
            if (user) {
                setResult(user);
            } else {
                setError('OPERATIVE NOT FOUND');
            }
        } catch (err) {
            setError('SIGNAL LOST. TRY AGAIN.');
        } finally {
            setLoading(false);
        }
    };

    const handleStartChat = () => {
        if (result) {
            onStartChat(result.id || (result as any)._id);
            setIsOpen(false);
            setResult(null);
            setPlayerId('');
        }
    };

    return (
        <>
            {/* Floating Plus Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-32 right-4 w-14 h-14 bg-gaming-accent rounded-2xl flex items-center justify-center text-black shadow-[0_0_20px_rgba(0,223,130,0.4)] hover:scale-110 active:scale-95 transition-all z-[40] cursor-pointer group"
                id="add-friend-fab"
            >
                <Plus size={28} className="group-hover:rotate-90 transition-transform duration-300" />
            </button>

            {/* Modal Overlay */}
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        onClick={() => setIsOpen(false)}
                    ></div>

                    <div className="relative w-full max-w-sm bg-[#0c0c12] border border-white/10 rounded-2xl overflow-hidden shadow-2xl animate-fade-in">
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-gaming-accent/10 to-transparent">
                            <div>
                                <h3 className="text-sm font-black uppercase italic tracking-wider text-white">Neural Search</h3>
                                <p className="text-[8px] text-gray-500 font-mono tracking-widest uppercase">Protocol: Player ID Sync</p>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 text-gray-500 hover:text-white transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Search Form */}
                            <form onSubmit={handleSearch} className="relative">
                                <input
                                    type="text"
                                    value={playerId}
                                    onChange={(e) => setPlayerId(e.target.value)}
                                    placeholder="ENTER PLAYER ID (e.g. IM-XXXX)..."
                                    className="w-full bg-black border border-white/10 rounded-xl py-4 pl-4 pr-12 text-[10px] text-white focus:border-gaming-accent outline-none font-mono uppercase tracking-[2px] transition-all placeholder:text-gray-700"
                                    autoFocus
                                />
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gaming-accent hover:bg-gaming-accent/10 rounded-lg transition-all"
                                >
                                    {loading ? (
                                        <div className="w-5 h-5 border-2 border-gaming-accent border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        <Search size={20} />
                                    )}
                                </button>
                            </form>

                            {/* Result Area */}
                            <div className="min-h-[120px] flex items-center justify-center border border-white/5 rounded-xl bg-black/30 bg-grid-pattern overflow-hidden relative">
                                {result ? (
                                    <div className="w-full p-4 flex flex-col items-center animate-slide-up">
                                        <div className="relative mb-3">
                                            <div className="w-20 h-20 rounded-2xl border-2 border-gaming-accent p-1 shadow-[0_0_15px_rgba(0,223,130,0.2)]">
                                                {result.avatarUrl ? (
                                                    <img src={result.avatarUrl} className="w-full h-full rounded-xl object-cover" alt="" />
                                                ) : (
                                                    <div className="w-full h-full bg-gaming-accent/10 flex items-center justify-center rounded-xl">
                                                        <UserIcon className="text-gaming-accent/40" size={32} />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="absolute -bottom-1 -right-1 bg-gaming-accent text-black p-1 rounded-lg">
                                                <Shield size={12} fill="currentColor" />
                                            </div>
                                        </div>

                                        <h4 className="text-lg font-black text-white italic tracking-tighter uppercase mb-1">{result.ign}</h4>
                                        <div className="flex items-center gap-2 mb-4">
                                            <span className="text-[8px] font-mono text-gray-500 bg-white/5 px-2 py-0.5 rounded uppercase">{result.playerId}</span>
                                            <span className="text-[8px] font-bold text-gaming-accent bg-gaming-accent/10 px-2 py-0.5 rounded uppercase">{result.role}</span>
                                        </div>

                                        <button
                                            onClick={handleStartChat}
                                            className="w-full py-4 bg-gaming-accent text-black font-black rounded-xl uppercase tracking-widest flex items-center justify-center gap-2 shadow-[0_4px_15px_rgba(0,223,130,0.3)] hover:scale-[1.02] active:scale-95 transition-all"
                                        >
                                            <MessageSquare size={18} fill="currentColor" />
                                            ESTABLISH LINK
                                        </button>
                                    </div>
                                ) : error ? (
                                    <div className="text-center p-6 animate-shake">
                                        <div className="text-red-500 font-black text-xs uppercase mb-2 tracking-widest">{error}</div>
                                        <p className="text-[8px] text-gray-600 font-mono uppercase">VERIFY ID AND RE-SCAN</p>
                                    </div>
                                ) : (
                                    <div className="text-center p-6 opacity-30">
                                        <Search size={32} className="mx-auto mb-3 text-gray-500" />
                                        <p className="text-[9px] text-gray-500 font-mono uppercase tracking-[3px]">Awaiting Signal Input</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer Decoration */}
                        <div className="h-1 bg-gradient-to-r from-transparent via-gaming-accent to-transparent opacity-20"></div>
                    </div>
                </div>
            )}

            <style>{`
                .clip-corner {
                    clip-path: polygon(15% 0, 100% 0, 100% 85%, 85% 100%, 0 100%, 0 15%);
                }
                .bg-grid-pattern {
                    background-image: radial-gradient(rgba(0, 223, 130, 0.05) 1px, transparent 1px);
                    background-size: 15px 15px;
                }
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    75% { transform: translateX(5px); }
                }
                .animate-shake {
                    animation: shake 0.2s ease-in-out 0s 2;
                }
            `}</style>
        </>
    );
};

export default AddFriendByID;
