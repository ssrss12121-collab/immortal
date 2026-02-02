import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Phone, Video, PhoneOff, Mic, MicOff, VideoOff, Camera, RefreshCw } from 'lucide-react';
import { useCalling } from '../utils/useCalling';

interface CallOverlayProps {
    isIncoming: boolean;
    peerName: string;
    peerAvatar?: string;
    callType: 'video' | 'audio';
    localStream: MediaStream | null;
    remoteStream: MediaStream | null;
    onAccept: () => void;
    onReject: () => void;
    onEnd: () => void;
}

const CallOverlay: React.FC<CallOverlayProps> = ({
    isIncoming,
    peerName,
    peerAvatar,
    callType,
    localStream,
    remoteStream,
    onAccept,
    onReject,
    onEnd
}) => {
    const { toggleMute, toggleVideo, enableCamera, switchCamera, callState } = useCalling();
    const [duration, setDuration] = useState(0);

    // Call duration timer
    useEffect(() => {
        let interval: any;
        if (!isIncoming && (localStream || remoteStream)) {
            interval = setInterval(() => setDuration(d => d + 1), 1000);
        }
        return () => clearInterval(interval);
    }, [isIncoming, localStream, remoteStream]);

    const formatDuration = (s: number) => {
        const mins = Math.floor(s / 60);
        const secs = s % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Robust stream attachment using callback refs
    // This ensures srcObject is set correctly even if the element is conditionally rendered
    const localVideoRef = useCallback((node: HTMLVideoElement | null) => {
        if (node && localStream) {
            console.log('[CallOverlay] 📹 Callback Ref: Attaching local stream');
            node.srcObject = localStream;
            node.play().catch(e => console.warn('[CallOverlay] Local play failed:', e));
        }
    }, [localStream]);

    const remoteVideoRef = useCallback((node: HTMLVideoElement | null) => {
        if (node && remoteStream) {
            console.log('[CallOverlay] 📹 Callback Ref: Attaching remote stream');
            node.srcObject = remoteStream;
            node.play().catch(e => console.warn('[CallOverlay] Remote play failed:', e));
        }
    }, [remoteStream]);

    // Check if video tracks exist AND are enabled
    const hasLocalVideo = localStream?.getVideoTracks().some(t => t.enabled) ?? false;
    const hasRemoteVideo = remoteStream?.getVideoTracks().some(t => t.enabled) ?? false;

    // INCOMING CALL UI
    if (isIncoming) {
        return (
            <div className="fixed inset-0 z-[100] bg-gradient-to-b from-black via-[#0a0a0f] to-black flex flex-col items-center justify-center px-6 safe-top safe-bottom animate-in fade-in duration-500">
                {/* Profile Picture */}
                <div className="flex flex-col items-center gap-6 mb-12">
                    <div className="relative">
                        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-gaming-accent/20 to-purple-600/20 p-1 shadow-[0_0_40px_rgba(0,223,130,0.3)] animate-pulse">
                            <img
                                src={peerAvatar || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${peerName}`}
                                className="w-full h-full rounded-full object-cover bg-black"
                                alt={peerName}
                            />
                        </div>
                    </div>
                    
                    {/* Name & Call Type */}
                    <div className="text-center">
                        <h2 className="text-2xl font-black uppercase italic tracking-wider text-white mb-2">{peerName}</h2>
                        <p className="text-sm text-gaming-accent font-mono uppercase tracking-widest">
                            {callType === 'video' ? '📹 ভিডিও কল' : '📞 ভয়েস কল'}
                        </p>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-8 mt-8">
                    <button
                        onClick={onReject}
                        className="w-20 h-20 rounded-full bg-red-500 text-white flex items-center justify-center shadow-[0_0_30px_rgba(239,68,68,0.5)] hover:scale-110 active:scale-95 transition-transform duration-200"
                    >
                        <PhoneOff size={32} />
                    </button>
                    <button
                        onClick={onAccept}
                        className="w-20 h-20 rounded-full bg-gaming-accent text-black flex items-center justify-center shadow-[0_0_30px_rgba(0,223,130,0.5)] hover:scale-110 active:scale-95 transition-transform duration-200"
                    >
                        {callType === 'video' ? <Video size={32} /> : <Phone size={32} />}
                    </button>
                </div>
            </div>
        );
    }

    // ACTIVE CALL UI
    return (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col safe-top safe-bottom">
            {/* Video Display Area */}
            <div className="relative flex-1 overflow-hidden">
                {/* Main Video Area */}
                <div className="absolute inset-0">
                    {hasRemoteVideo ? (
                        <video
                            ref={remoteVideoRef}
                            autoPlay
                            playsInline
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        // No remote video - show profile picture with timer
                        <div className="absolute inset-0 bg-gradient-to-b from-[#0c0c12] to-black flex items-center justify-center">
                            <div className="flex flex-col items-center gap-4">
                                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-gaming-accent/20 to-purple-600/20 p-1 shadow-[0_0_40px_rgba(0,223,130,0.2)]">
                                    <img
                                        src={peerAvatar || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${peerName}`}
                                        className="w-full h-full rounded-full object-cover bg-black"
                                        alt={peerName}
                                    />
                                </div>
                                <h3 className="text-xl font-bold text-white">{peerName}</h3>
                                <p className="text-gaming-accent text-sm font-mono">{formatDuration(duration)}</p>
                                {callState.remoteVideoOff && (
                                    <p className="text-gray-500 text-[10px] uppercase font-mono tracking-widest mt-2">Remote Camera Off</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Local Video Preview (Small) - Always show if camera is on */}
                {hasLocalVideo && (
                    <div className="absolute top-4 right-4 w-28 h-36 bg-black border-2 border-gaming-accent/30 rounded-xl overflow-hidden shadow-2xl z-20 animate-in zoom-in duration-300">
                        <video
                            ref={localVideoRef}
                            autoPlay
                            muted
                            playsInline
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/60 backdrop-blur-sm rounded-full px-2 py-0.5 border border-white/10">
                            <div className="w-1.5 h-1.5 rounded-full bg-gaming-accent animate-pulse"></div>
                            <p className="text-white text-[8px] font-black uppercase tracking-tighter">Live</p>
                        </div>
                        <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-gaming-accent/20 backdrop-blur-sm rounded-md px-1.5 py-0.5 border border-gaming-accent/30">
                            <p className="text-gaming-accent text-[8px] font-black uppercase">You</p>
                        </div>
                    </div>
                )}

                {/* Top Info Bar */}
                <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/90 to-transparent px-6 py-8 z-10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full border border-white/10 p-0.5">
                                <img
                                    src={peerAvatar || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${peerName}`}
                                    className="w-full h-full rounded-full object-cover bg-black"
                                    alt={peerName}
                                />
                            </div>
                            <div>
                                <p className="text-white text-sm font-black uppercase italic tracking-wider">{peerName}</p>
                                <p className="text-gaming-accent text-[10px] font-mono tracking-widest">{formatDuration(duration)}</p>
                            </div>
                        </div>
                        {callState.status === 'STABLE' && (
                            <div className="flex items-center gap-2 bg-gaming-accent/10 border border-gaming-accent/20 px-3 py-1.5 rounded-full">
                                <div className="w-1.5 h-1.5 rounded-full bg-gaming-accent animate-pulse"></div>
                                <span className="text-gaming-accent text-[9px] font-black uppercase tracking-widest">Encrypted</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Bottom Controls */}
            <div className="bg-gradient-to-t from-black via-black/95 to-transparent px-6 py-8 safe-bottom">
                <div className="flex items-center justify-center gap-5 max-w-sm mx-auto">
                    {/* Mute Button */}
                    <button
                        onClick={toggleMute}
                        className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 ${
                            callState.isMuted 
                                ? 'bg-red-500/90 text-white shadow-[0_0_20px_rgba(239,68,68,0.3)]' 
                                : 'bg-white/5 text-white border border-white/10 hover:bg-white/10 active:scale-90'
                        }`}
                    >
                        {callState.isMuted ? <MicOff size={22} className="animate-in zoom-in" /> : <Mic size={22} />}
                    </button>

                    {/* Camera Toggle Button */}
                    <button
                        onClick={() => {
                            if (hasLocalVideo) {
                                toggleVideo();
                            } else {
                                enableCamera();
                            }
                        }}
                        className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 ${
                            callState.isVideoOff || !hasLocalVideo
                                ? 'bg-red-500/90 text-white shadow-[0_0_20px_rgba(239,68,68,0.3)]' 
                                : 'bg-white/5 text-white border border-white/10 hover:bg-white/10 active:scale-90'
                        }`}
                    >
                        {callState.isVideoOff || !hasLocalVideo ? <VideoOff size={22} className="animate-in zoom-in" /> : <Camera size={22} />}
                    </button>

                    {/* Switch Camera (mobile only) */}
                    {hasLocalVideo && (
                        <button
                            onClick={switchCamera}
                            className="w-14 h-14 rounded-full bg-white/5 text-white border border-white/10 hover:bg-white/10 flex items-center justify-center transition-all active:scale-90"
                        >
                            <RefreshCw size={22} />
                        </button>
                    )}

                    {/* End Call Button */}
                    <button
                        onClick={onEnd}
                        className="w-18 h-18 rounded-full bg-red-600 text-white flex items-center justify-center shadow-[0_0_30px_rgba(220,38,38,0.4)] hover:scale-110 active:scale-95 transition-all duration-300"
                    >
                        <PhoneOff size={32} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CallOverlay;
