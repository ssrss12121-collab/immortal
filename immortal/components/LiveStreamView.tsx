import React, { useState, useEffect, useRef } from 'react';
import { X, Play, Radio, Users, Heart, MessageSquare, Mic, MicOff, Monitor, MonitorOff, Send, Shield, Zap, Plus, User as UserIcon } from 'lucide-react';
import { UserProfile } from '../types';
import { useWebRTC } from '../utils/useWebRTC';
import { getSocket } from '../utils/socket';

interface LiveStreamViewProps {
    user: UserProfile;
    session: any; // LiveSession data
    onClose: () => void;
    isHost?: boolean;
}

const LiveStreamView: React.FC<LiveStreamViewProps> = ({ user, session, onClose, isHost = false }) => {
    const [comments, setComments] = useState<any[]>([]);
    const [reactions, setReactions] = useState<any[]>([]);
    const [viewerCount, setViewerCount] = useState(0);
    const [inputText, setInputText] = useState('');
    const [micEnabled, setMicEnabled] = useState(true);
    const [screenEnabled, setScreenEnabled] = useState(false);
    const [remoteStreams, setRemoteStreams] = useState<MediaStream[]>([]);

    const socket = getSocket();
    const commentEndRef = useRef<HTMLDivElement>(null);
    const localVideoRef = useRef<HTMLVideoElement>(null);

    const { localStream, toggleMic, toggleScreen } = useWebRTC({
        sessionId: session.id || session.sourceId,
        isHost,
        onRemoteStream: (stream) => setRemoteStreams(prev => [...prev, stream])
    });

    useEffect(() => {
        if (localVideoRef.current && localStream) {
            localVideoRef.current.srcObject = localStream;
        }
    }, [localStream]);

    useEffect(() => {
        // Mocking comments and viewer count
        setViewerCount(Math.floor(Math.random() * 500) + 100);
        setComments([
            { id: '1', senderName: 'GhostRider', text: 'LETS GOOO! 🔥', timestamp: new Date() },
            { id: '2', senderName: 'SniperKing', text: 'Insane skill calibration.', timestamp: new Date() },
        ]);

        // Socket listeners for comments and reactions
        socket.on('new-live-comment', (comment) => setComments(prev => [...prev, { ...comment, id: Date.now().toString() }]));
        socket.on('new-reaction', (reaction) => {
            const id = Date.now();
            setReactions(prev => [...prev, { id, type: reaction.type, x: Math.random() * 80 + 10 }]);
            setTimeout(() => setReactions(prev => prev.filter(r => r.id !== id)), 2000);
        });

        return () => {
            socket.off('new-live-comment');
            socket.off('new-reaction');
        };
    }, []);

    useEffect(() => {
        commentEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [comments]);

    const handleSendComment = () => {
        if (!inputText.trim()) return;
        socket.emit('send-live-comment', {
            sessionId: session.id || session.sourceId,
            senderName: user.ign,
            text: inputText
        });
        setInputText('');
    };

    const addReaction = (type: string) => {
        socket.emit('send-reaction', {
            sessionId: session.id || session.sourceId,
            type
        });
    };

    return (
        <div className="fixed inset-0 bg-black z-50 flex flex-col animate-fade-in overflow-hidden">
            {/* Live Video Surface */}
            <div className="relative flex-1 bg-[#050508] overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center p-6">
                    {session?.type === 'Audio' || session?.sourceType === 'audio' ? (
                        <div className="w-full max-w-lg">
                            {/* Audio Grid Header */}
                            <div className="text-center mb-10">
                                <div className="w-20 h-20 bg-gaming-accent/10 border border-gaming-accent/30 rounded-full flex items-center justify-center mx-auto mb-4 relative">
                                    <div className="absolute inset-0 bg-gaming-accent/20 rounded-full animate-ping opacity-20"></div>
                                    <Radio size={32} className="text-gaming-accent animate-pulse" />
                                </div>
                                <h4 className="text-white font-black uppercase tracking-[0.3em] text-sm">SECURE VOICE CHANNEL</h4>
                                <p className="text-[9px] text-gray-600 font-mono tracking-widest mt-1">ENCRYPTED END-TO-END</p>
                            </div>

                            {/* Avatars Grid */}
                            <div className="grid grid-cols-3 gap-8 justify-items-center">
                                {/* Host Avatar */}
                                <div className="flex flex-col items-center gap-3">
                                    <div className="w-16 h-16 bg-gaming-accent p-1 rounded-full relative shadow-[0_0_20px_rgba(0,223,130,0.3)]">
                                        <img src={session?.hostAvatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${session?.hostId}`} className="w-full h-full rounded-full object-cover" />
                                        <div className="absolute -bottom-1 -right-1 bg-black p-1 rounded-full border border-gaming-accent">
                                            <Shield size={10} className="text-gaming-accent" />
                                        </div>
                                    </div>
                                    <span className="text-[9px] font-black text-white uppercase italic truncate w-20 text-center tracking-tighter">{session?.hostName || 'HOST'}</span>
                                </div>

                                {/* Participant Slots */}
                                {[1, 2, 3, 4, 5].map(i => (
                                    <div key={i} className="flex flex-col items-center gap-3 group">
                                        <div className={`w-16 h-16 bg-[#1a1a24] border border-white/5 rounded-full flex items-center justify-center transition-all ${i < 3 ? 'border-gaming-accent/40 shadow-[0_0_15px_rgba(0,223,130,0.1)]' : 'opacity-40'}`}>
                                            {i < 3 ? (
                                                <img src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=user${i}`} className="w-full h-full rounded-full object-cover p-1" />
                                            ) : (
                                                <UserIcon size={24} className="text-gray-700" />
                                            )}
                                            {i < 3 && Math.random() > 0.5 && (
                                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gaming-accent rounded-full border-2 border-black flex items-center justify-center animate-bounce">
                                                    <Mic size={8} className="text-black" />
                                                </div>
                                            )}
                                        </div>
                                        <span className="text-[9px] font-bold text-gray-500 uppercase tracking-tighter truncate w-16 text-center">{i < 3 ? `OPERATIVE_${i}` : 'EMPTY'}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : localStream ? (
                        <video
                            ref={localVideoRef}
                            autoPlay
                            muted
                            playsInline
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#0c0c12] to-black flex items-center justify-center">
                            <div className="text-center space-y-4">
                                <Zap size={64} className="mx-auto text-gaming-accent/20 animate-pulse" />
                                <p className="text-[10px] text-gray-700 font-black uppercase tracking-widest">Awaiting Video Uplink...</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Overlay: Top Controls */}
                <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start bg-gradient-to-b from-black/80 to-transparent z-20">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gaming-accent border border-black/20 clip-corner-sm flex items-center justify-center p-0.5 shadow-lg">
                            <img src={session?.hostAvatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${session?.hostId}`} className="w-full h-full object-cover clip-corner-sm" />
                        </div>
                        <div>
                            <h3 className="text-sm font-black uppercase italic text-white tracking-widest">{session?.hostName || 'OPERATOR_X'}</h3>
                            <div className="flex items-center gap-3">
                                <span className="flex items-center gap-1 bg-red-600 px-1.5 py-0.5 rounded-[4px] text-[8px] font-black animate-pulse">
                                    <Radio size={10} /> LIVE
                                </span>
                                <span className="flex items-center gap-1 text-[9px] font-bold text-gray-300 uppercase tracking-tighter">
                                    <Users size={12} className="text-gaming-accent" /> {viewerCount} Viewers
                                </span>
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2.5 bg-white/10 hover:bg-red-600 text-white rounded-xl backdrop-blur-md transition-all">
                        <X size={20} />
                    </button>
                </div>

                {/* Overlay: Floating Reactions */}
                <div className="absolute inset-0 pointer-events-none z-10">
                    {reactions.map(r => (
                        <div
                            key={r.id}
                            className="absolute bottom-12 animate-float-up opacity-0"
                            style={{ left: `${r.x}%` }}
                        >
                            <span className="text-2xl">{r.type}</span>
                        </div>
                    ))}
                </div>

                {/* Overlay: Multi-Host Slots (Bottom Left) */}
                {session?.type === 'Slot-Based' && (
                    <div className="absolute bottom-24 left-4 flex flex-col space-y-2 z-20">
                        <div className="flex -space-x-3">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="w-10 h-10 bg-[#0c0c12] border-2 border-gaming-accent/40 rounded-full flex items-center justify-center p-0.5 hover:translate-y-[-4px] transition-transform">
                                    <img src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=user${i}`} className="w-full h-full rounded-full" />
                                </div>
                            ))}
                            <button className="w-10 h-10 bg-black/80 border-2 border-dashed border-white/20 rounded-full flex items-center justify-center text-white/40 hover:border-gaming-accent hover:text-gaming-accent transition-colors">
                                <Plus size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Interaction Footer */}
            <div className="bg-[#0c0c12] border-t border-white/5 p-4 space-y-4">
                {/* Chat Display */}
                <div className="h-32 bg-black/40 rounded-2xl p-2 overflow-y-auto space-y-2 scrollbar-hide border border-white/5">
                    {comments.map(c => (
                        <div key={c.id} className="flex space-x-2 items-start animate-fade-in">
                            <span className="text-[9px] font-black text-gaming-accent uppercase tracking-tighter shrink-0 mt-0.5">{c.senderName}:</span>
                            <span className="text-[10px] text-gray-300 leading-tight">{c.text}</span>
                        </div>
                    ))}
                    <div ref={commentEndRef} />
                </div>

                {/* Input & Controls */}
                <div className="flex items-center space-x-3">
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            value={inputText}
                            onChange={e => setInputText(e.target.value)}
                            onKeyPress={e => e.key === 'Enter' && handleSendComment()}
                            placeholder="TRANSMIT COMMS..."
                            className="w-full bg-black border border-white/10 rounded-2xl py-4 pl-4 pr-12 text-xs text-white focus:border-gaming-accent outline-none font-mono tracking-widest uppercase"
                        />
                        <button
                            onClick={handleSendComment}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gaming-accent p-2 hover:scale-110 transition-transform"
                        >
                            <Send size={18} />
                        </button>
                    </div>

                    <div className="flex space-x-2">
                        <button
                            onClick={() => addReaction('🔥')}
                            className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center hover:bg-white/10 transition-all text-xl"
                        >
                            🔥
                        </button>
                        {isHost || session?.type === 'Slot-Based' ? (
                            <button
                                onClick={() => setMicEnabled(!micEnabled)}
                                className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all ${micEnabled ? 'bg-gaming-accent/10 border-gaming-accent/40 text-gaming-accent' : 'bg-red-600/10 border-red-600/40 text-red-500'}`}
                            >
                                {micEnabled ? <Mic size={20} /> : <MicOff size={20} />}
                            </button>
                        ) : null}
                        {isHost && (
                            <button
                                onClick={() => setScreenEnabled(!screenEnabled)}
                                className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all ${screenEnabled ? 'bg-gaming-accent text-black border-gaming-accent' : 'bg-white/5 border-white/10 text-gray-500'}`}
                            >
                                {screenEnabled ? <Monitor size={20} /> : <MonitorOff size={20} />}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Background Performance Guard Overlay (Pulse) */}
            <div className="hidden">
                {/* Logic to keep audio context alive in background */}
            </div>
        </div>
    );
};

export default LiveStreamView;
