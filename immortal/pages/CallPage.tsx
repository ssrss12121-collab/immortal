import React, { useEffect, useState, useRef } from 'react';
import { Phone, Video, PhoneOff, Mic, MicOff, VideoOff, Camera, SwitchCamera, Monitor, MonitorOff } from 'lucide-react';
import { useCalling } from '../utils/useCalling';

interface CallPageProps {
    onEnd: () => void;
}

const CallPage: React.FC<CallPageProps> = ({ onEnd }) => {
    const {
        callState,
        acceptCall,
        rejectCall,
        endCall,
        toggleMute,
        toggleVideo,
        startScreenShare,
        stopScreenShare,
        switchCamera
    } = useCalling();

    const [duration, setDuration] = useState(0);
    const [showLocalLarge, setShowLocalLarge] = useState(false);
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const remoteAudioRef = useRef<HTMLAudioElement>(null);
    const localPIPRef = useRef<HTMLVideoElement>(null); // Dedicated PIP ref

    // Duration timer
    useEffect(() => {
        let interval: any;
        if (callState.status === 'STABLE') {
            interval = setInterval(() => setDuration(d => d + 1), 1000);
        } else {
            setDuration(0);
        }
        return () => clearInterval(interval);
    }, [callState.status]);

    // Attach local stream - track stream ID to detect changes
    useEffect(() => {
        if (localVideoRef.current && callState.localStream) {
            console.log('[CallPage] 📹 Attaching LOCAL stream');
            console.log('[CallPage] Local Stream ID:', callState.localStream.id);
            const tracks = callState.localStream.getTracks();
            console.log('[CallPage] Local Tracks:', tracks.map(t => `${t.kind}:enabled=${t.enabled}:ready=${t.readyState}`));
            
            // Check video track specifically
            const videoTrack = callState.localStream.getVideoTracks()[0];
            if (videoTrack) {
                console.log('[CallPage] 📹 Local video track details:', {
                    id: videoTrack.id,
                    label: videoTrack.label,
                    enabled: videoTrack.enabled,
                    muted: videoTrack.muted,
                    readyState: videoTrack.readyState,
                    settings: videoTrack.getSettings()
                });
            } else {
                console.warn('[CallPage] ⚠️ No video track in local stream!');
            }
            
            // Attach stream
            localVideoRef.current.srcObject = callState.localStream;
            localVideoRef.current.muted = true;
            localVideoRef.current.play()
                .then(() => {
                    console.log('[CallPage] ✅ Local video PLAYING');
                    console.log('[CallPage] Video element state:', {
                        videoWidth: localVideoRef.current?.videoWidth,
                        videoHeight: localVideoRef.current?.videoHeight,
                        paused: localVideoRef.current?.paused,
                        readyState: localVideoRef.current?.readyState
                    });
                })
                .catch(e => console.error('[CallPage] ❌ Local play error:', e));
        } else {
            if (!localVideoRef.current) console.warn('[CallPage] ⚠️ Local video ref not ready');
            if (!callState.localStream) console.warn('[CallPage] ⚠️ No local stream');
        }
    }, [callState.localStream, callState.localStream?.id]);  // Also track stream ID

    // Attach remote stream to BOTH video and audio elements
    useEffect(() => {
        if (callState.remoteStream) {
            console.log('[CallPage] 🎬 Attaching REMOTE stream to video+audio');
            const tracks = callState.remoteStream.getTracks();
            console.log('[CallPage] Remote stream tracks:', tracks.map(t => `${t.kind}:enabled=${t.enabled}:ready=${t.readyState}`));
            
            // Check remote video track
            const videoTrack = callState.remoteStream.getVideoTracks()[0];
            if (videoTrack) {
                console.log('[CallPage] 📹 Remote video track details:', {
                    id: videoTrack.id,
                    label: videoTrack.label,
                    enabled: videoTrack.enabled,
                    readyState: videoTrack.readyState
                });
            } else {
                console.warn('[CallPage] ⚠️ No video track in remote stream!');
            }

            // Attach to video element (shows video, plays audio)
            if (remoteVideoRef.current) {
                // Force detach first to ensure clean re-attach
                remoteVideoRef.current.srcObject = null;
                
                setTimeout(() => {
                    if (remoteVideoRef.current && callState.remoteStream) {
                        remoteVideoRef.current.srcObject = callState.remoteStream;
                        remoteVideoRef.current.muted = false;
                        remoteVideoRef.current.volume = 1.0;
                        remoteVideoRef.current.play().then(() => {
                            console.log('[CallPage] ✅ Remote video+audio playing');
                            
                            // Log video element state
                            setTimeout(() => {
                                if (remoteVideoRef.current) {
                                    console.log('[CallPage] Remote video element state:', {
                                        videoWidth: remoteVideoRef.current.videoWidth,
                                        videoHeight: remoteVideoRef.current.videoHeight,
                                        paused: remoteVideoRef.current.paused,
                                        readyState: remoteVideoRef.current.readyState
                                    });
                                }
                            }, 500);
                        }).catch(e => console.error('[CallPage] ❌ Remote play failed:', e));
                    }
                }, 100);
            }

            // ALSO attach to dedicated audio element for better audio handling
            if (remoteAudioRef.current) {
                remoteAudioRef.current.srcObject = callState.remoteStream;
                remoteAudioRef.current.volume = 1.0;
                remoteAudioRef.current.play().catch(e => console.warn('Remote audio play error:', e));
            }
        }
    }, [
        callState.remoteStream, 
        callState.remoteStream?.id,
        // ⭐ CRITICAL: Also track video track count changes
        callState.remoteStream?.getVideoTracks().length
    ]);

    // Attach local stream to PIP (stable, no re-render flicker)
    useEffect(() => {
        if (localPIPRef.current && callState.localStream) {
            console.log('[CallPage] 🎥 Attaching local stream to PIP');
            localPIPRef.current.srcObject = callState.localStream;
            localPIPRef.current.play().catch(e => console.warn('[PIP] Play error:', e));
        }
    }, [callState.localStream, callState.localStream?.id]);

    const formatDuration = (s: number) => {
        const mins = Math.floor(s / 60);
        const secs = s % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleAccept = () => {
        console.log('[CallPage] 📞 User clicked ACCEPT');
        acceptCall();
    };

    const handleEnd = () => {
        console.log('[CallPage] ❌ User clicked END');
        endCall();
    };

    if (callState.status === 'IDLE') {
        onEnd();
        return null;
    }

    const isActive = callState.status === 'STABLE';
    const isRinging = callState.status === 'RINGING' || callState.status === 'CONNECTING';
    
    // Check video availability
    const hasLocalVideoTrack = callState.localStream?.getVideoTracks().some(t => t.enabled);
    const hasRemoteVideoTrack = callState.remoteStream?.getVideoTracks().some(t => t.enabled);
    
    console.log('[CallPage] Video status:', {
        callType: callState.callType,
        isVideoOff: callState.isVideoOff,
        hasLocalVideoTrack,
        hasRemoteVideoTrack,
        localStreamTracks: callState.localStream?.getTracks().map(t => `${t.kind}:${t.enabled}`),
        remoteStreamTracks: callState.remoteStream?.getTracks().map(t => `${t.kind}:${t.enabled}`)
    });
    
    // Simplified video display logic - if track exists and enabled, show it!
    const showLocalVideo = callState.localStream && hasLocalVideoTrack;
    const showRemoteVideo = callState.remoteStream && hasRemoteVideoTrack;
    
    // ⭐ CRITICAL FIX: Show video UI if ANY video track exists, regardless of callType
    // This fixes the issue where callType might not update but video tracks DO exist
    const isVideoCall = showLocalVideo || showRemoteVideo || callState.callType === 'video';

    return (
        <div className="fixed inset-0 z-[200] bg-gradient-to-br from-[#0a0a12] via-[#15151f] to-[#0a0a12] text-white flex flex-col">
            
            {/* Hidden audio element for better audio handling */}
            <audio ref={remoteAudioRef} autoPlay playsInline />

            {/* INCOMING CALL UI - Simple & Clean */}
            {isRinging && callState.isIncoming && (
                <div className="flex-1 flex flex-col items-center justify-center gap-8 px-6">
                    <div className="text-center space-y-4">
                        <div className="w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-gaming-accent/30 shadow-2xl animate-pulse">
                            <img 
                                src={callState.peerAvatar || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${callState.peerName || 'User'}`}
                                alt={callState.peerName || 'Unknown'}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <h2 className="text-2xl font-black uppercase tracking-wide">{callState.peerName || 'Unknown'}</h2>
                        <p className="text-sm text-gray-400 uppercase tracking-widest">
                            {callState.callType === 'video' ? '📹 Video Call' : '📞 Voice Call'}
                        </p>
                    </div>

                    <div className="flex gap-6">
                        <button
                            onClick={() => rejectCall()}
                            className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center shadow-lg active:scale-95 transition-all"
                        >
                            <PhoneOff size={24} />
                        </button>
                        <button
                            onClick={handleAccept}
                            className="w-16 h-16 rounded-full bg-green-600 hover:bg-green-700 flex items-center justify-center shadow-lg active:scale-95 transition-all animate-pulse"
                        >
                            <Phone size={24} />
                        </button>
                    </div>
                </div>
            )}

            {/* OUTGOING CALL UI */}
            {isRinging && !callState.isIncoming && (
                <div className="flex-1 flex flex-col items-center justify-center gap-8 px-6">
                    <div className="text-center space-y-4">
                        <div className="w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-gaming-accent/30 shadow-2xl">
                            <img 
                                src={callState.peerAvatar || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${callState.peerName || 'User'}`}
                                alt={callState.peerName || 'Unknown'}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <h2 className="text-2xl font-black uppercase tracking-wide">{callState.peerName || 'Unknown'}</h2>
                        <p className="text-sm text-gaming-accent uppercase tracking-widest animate-pulse">Calling...</p>
                    </div>

                    <button
                        onClick={handleEnd}
                        className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center shadow-lg active:scale-95 transition-all"
                    >
                        <PhoneOff size={24} />
                    </button>
                </div>
            )}

            {/* ACTIVE CALL UI */}
            {isActive && (
                <>
                    {/* Main View */}
                    <div className="flex-1 relative bg-black">
                        {isVideoCall ? (
                            <>
                                {/* Main View - Remote Video OR Profile Pic */}
                                {showRemoteVideo ? (
                                    // Remote camera ON - show video
                                    <video
                                        ref={remoteVideoRef}
                                        autoPlay
                                        playsInline
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    // Remote camera OFF - show profile picture
                                    <div className="w-full h-full flex flex-col items-center justify-center gap-6 bg-gradient-to-br from-[#0a0a12] via-[#15151f] to-[#0a0a12]">
                                        <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-gaming-accent/20 shadow-2xl">
                                            <img 
                                                src={callState.peerAvatar || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${callState.peerName || 'User'}`}
                                                alt={callState.peerName || 'Unknown'}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="text-center">
                                            <h3 className="text-2xl font-bold uppercase tracking-wide">{callState.peerName || 'Unknown'}</h3>
                                            <p className="text-sm text-gray-400 mt-2">{formatDuration(duration)}</p>
                                        </div>
                                        <div className="bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-2">
                                            <VideoOff size={14} />
                                            <span className="text-xs">Camera Off</span>
                                        </div>
                                    </div>
                                )}

                                {/* Local Video PIP - Only when camera ON */}
                                {showLocalVideo && (
                                    <div className="absolute top-4 right-4 w-24 h-32 bg-black rounded-xl overflow-hidden border-2 border-white/30 shadow-2xl">
                                        <video
                                            ref={localPIPRef}
                                            autoPlay
                                            playsInline
                                            muted
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                )}
                            </>
                        ) : (
                            // Voice Call UI - Show avatar
                            <div className="w-full h-full flex flex-col items-center justify-center gap-6 bg-gradient-to-br from-[#0a0a12] via-[#15151f] to-[#0a0a12]">
                                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gaming-accent/20 shadow-2xl">
                                    <img 
                                        src={callState.peerAvatar || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${callState.peerName || 'User'}`}
                                        alt={callState.peerName || 'Unknown'}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <h3 className="text-xl font-bold uppercase tracking-wide">{callState.peerName || 'Unknown'}</h3>
                                
                                {/* Show small local camera preview if turned on during voice call */}
                                {showLocalVideo && (
                                    <div className="w-32 h-40 bg-black rounded-xl overflow-hidden border-2 border-gaming-accent/30 shadow-xl">
                                        <video
                                            ref={localVideoRef}
                                            autoPlay
                                            playsInline
                                            muted
                                            className="w-full h-full object-cover"
                                        />
                                        <p className="text-[8px] text-center text-gray-400 mt-1">Your Camera</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Duration Overlay - Only show when remote video visible */}
                        {showRemoteVideo && (
                            <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-full">
                                <p className="text-sm font-mono tracking-wider">{formatDuration(duration)}</p>
                            </div>
                        )}

                        {/* Remote status indicators */}
                        {callState.remoteMuted && (
                            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-600/80 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-2">
                                <MicOff size={12} />
                                <span className="text-xs font-bold">Muted</span>
                            </div>
                        )}
                    </div>

                    {/* Control Bar */}
                    <div className="bg-[#0c0c12]/95 backdrop-blur-md border-t border-white/10 p-6">
                        <div className="flex items-center justify-center gap-4">
                            {/* Mute */}
                            <button
                                onClick={toggleMute}
                                className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                                    callState.isMuted 
                                        ? 'bg-red-600 hover:bg-red-700' 
                                        : 'bg-white/10 hover:bg-white/20'
                                }`}
                            >
                                {callState.isMuted ? <MicOff size={20} /> : <Mic size={20} />}
                            </button>

                            {/* Video Toggle */}
                            <button
                                onClick={toggleVideo}
                                className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                                    callState.isVideoOff 
                                        ? 'bg-white/10 hover:bg-white/20' 
                                        : 'bg-gaming-accent text-black hover:bg-gaming-accent/80'
                                }`}
                            >
                                {callState.isVideoOff ? <VideoOff size={20} /> : <Video size={20} />}
                            </button>

                            {/* Screen Share */}
                            {isVideoCall && (
                                <button
                                    onClick={callState.isScreenSharing ? stopScreenShare : startScreenShare}
                                    className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                                        callState.isScreenSharing 
                                            ? 'bg-purple-600 hover:bg-purple-700' 
                                            : 'bg-white/10 hover:bg-white/20'
                                    }`}
                                >
                                    {callState.isScreenSharing ? <MonitorOff size={20} /> : <Monitor size={20} />}
                                </button>
                            )}

                            {/* Switch Camera (mobile) */}
                            {isVideoCall && !callState.isVideoOff && (
                                <button
                                    onClick={switchCamera}
                                    className="w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
                                >
                                    <SwitchCamera size={20} />
                                </button>
                            )}

                            {/* End Call */}
                            <button
                                onClick={handleEnd}
                                className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center transition-all shadow-lg"
                            >
                                <PhoneOff size={20} />
                            </button>
                        </div>
                    </div>
                </>
            )}

            {/* Status Messages */}
            {callState.status === 'BUSY' && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                    <div className="text-center">
                        <h3 className="text-2xl font-bold mb-2">Busy</h3>
                        <p className="text-gray-400">User is in another call</p>
                    </div>
                </div>
            )}

            {callState.status === 'OFFLINE' && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                    <div className="text-center">
                        <h3 className="text-2xl font-bold mb-2">Offline</h3>
                        <p className="text-gray-400">User is not available</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CallPage;
