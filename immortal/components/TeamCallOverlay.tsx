import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Users, Monitor, Maximize2, Minimize2, Shield, Zap } from 'lucide-react';
import { useMediasoup, RemoteParticipant } from '../utils/useMediasoup';

interface TeamCallOverlayProps {
    teamId: string;
    teamName: string;
    onClose: () => void;
}

const ParticipantCard: React.FC<{ participant: RemoteParticipant, isLocal?: boolean }> = ({ participant, isLocal = false }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const screenRef = useRef<HTMLVideoElement>(null);
    const audioRef = useRef<HTMLAudioElement>(null);

    useEffect(() => {
        if (participant.streams.video && videoRef.current) {
            videoRef.current.srcObject = participant.streams.video;
        }
        if (participant.streams.screen && screenRef.current) {
            screenRef.current.srcObject = participant.streams.screen;
        }
        if (participant.streams.audio && audioRef.current && !isLocal) {
            audioRef.current.srcObject = participant.streams.audio;
        }
    }, [participant.streams, isLocal]);

    const hasScreen = !!participant.streams.screen;
    const hasVideo = !!participant.streams.video;

    return (
        <div className={`relative rounded-3xl overflow-hidden bg-[#12121a] border ${hasScreen ? 'border-gaming-accent/50' : 'border-white/5'} transition-all duration-500 flex flex-col`}>
            {/* Audio Element (Remote Only) */}
            {!isLocal && <audio autoPlay ref={audioRef} />}

            <div className="relative flex-1 min-h-[150px] overflow-hidden">
                {hasScreen ? (
                    <div className="w-full h-full relative">
                        <video ref={screenRef} autoPlay playsInline className="w-full h-full object-contain bg-black" />
                        {hasVideo && (
                            <div className="absolute bottom-2 right-2 w-24 aspect-video border border-white/20 rounded-lg overflow-hidden shadow-2xl z-20">
                                <video ref={videoRef} autoPlay muted={isLocal} playsInline className="w-full h-full object-cover" />
                            </div>
                        )}
                        <div className="absolute top-3 left-3 bg-gaming-accent/90 text-black text-[8px] font-black px-2 py-1 rounded uppercase tracking-widest flex items-center gap-1">
                            <Monitor size={10} /> Broadcasting Screen
                        </div>
                    </div>
                ) : hasVideo ? (
                    <video ref={videoRef} autoPlay muted={isLocal} playsInline className="w-full h-full object-cover" />
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-gaming-accent/5 to-transparent">
                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                            <Users className="text-gray-600" size={32} />
                        </div>
                    </div>
                )}

                {/* Status Overlay */}
                <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center pointer-events-none">
                    <div className="bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg text-[8px] font-bold text-white uppercase tracking-widest border border-white/10 flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${isLocal ? 'bg-gaming-accent' : 'bg-blue-500'}`}></div>
                        {isLocal ? 'You (Alpha)' : `Operative // ${participant.userId.slice(-4)}`}
                    </div>
                    {!participant.streams.audio && !isLocal && (
                        <div className="bg-red-500/20 p-1 rounded-lg border border-red-500/30">
                            <MicOff size={10} className="text-red-500" />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const TeamCallOverlay: React.FC<TeamCallOverlayProps> = ({ teamId, teamName, onClose }) => {
    const { produce, stopProducing, participants } = useMediasoup({ teamId });
    const [localParticipant, setLocalParticipant] = useState<RemoteParticipant>({
        userId: 'local',
        streams: { video: undefined, audio: undefined, screen: undefined }
    });


    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(true);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [duration, setDuration] = useState(0);

    const producers = useRef<any>({ audio: null, video: null, screen: null });

    useEffect(() => {
        const timer = setInterval(() => setDuration(d => d + 1), 1000);
        initLocalMedia();
        return () => {
            clearInterval(timer);
            stopAllLocalTracks();
        };
    }, []);

    const stopAllLocalTracks = () => {
        Object.values(localParticipant.streams).forEach((stream: any) => {
            stream?.getTracks().forEach((t: any) => t.stop());
        });
    };

    const initLocalMedia = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const audioTrack = stream.getAudioTracks()[0];
            if (audioTrack) {
                producers.current.audio = await produce(audioTrack);
                setLocalParticipant((prev: any) => ({
                    ...prev,
                    streams: { ...prev.streams, audio: new MediaStream([audioTrack]) }
                }));
            }
        } catch (err) {
            console.error('Failed to init local media', err);
        }
    };

    const toggleMic = () => {
        const track = localParticipant.streams.audio?.getAudioTracks()[0];
        if (track) {
            track.enabled = isMuted;
            setIsMuted(!isMuted);
        }
    };

    const toggleVideo = async () => {
        if (isVideoOff) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                const videoTrack = stream.getVideoTracks()[0];
                producers.current.video = await produce(videoTrack);
                setLocalParticipant((prev: any) => ({
                    ...prev,
                    streams: { ...prev.streams, video: new MediaStream([videoTrack]) }
                }));
                setIsVideoOff(false);
            } catch (err) { }
        } else {
            localParticipant.streams.video?.getTracks().forEach((t: any) => t.stop());
            if (producers.current.video) {
                stopProducing(producers.current.video.id);
                producers.current.video = null;
            }
            setLocalParticipant((prev: any) => ({
                ...prev,
                streams: { ...prev.streams, video: undefined }
            }));
            setIsVideoOff(true);
        }
    };

    const toggleScreenShare = async () => {
        if (!isScreenSharing) {
            try {
                const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
                const screenTrack = stream.getVideoTracks()[0];
                producers.current.screen = await produce(screenTrack, true);
                setLocalParticipant((prev: any) => ({
                    ...prev,
                    streams: { ...prev.streams, screen: new MediaStream([screenTrack]) }
                }));
                setIsScreenSharing(true);

                screenTrack.onended = () => {
                    stopScreenShare();
                };
            } catch (err) { }
        } else {
            stopScreenShare();
        }
    };

    const stopScreenShare = () => {
        localParticipant.streams.screen?.getTracks().forEach((t: any) => t.stop());
        if (producers.current.screen) {
            stopProducing(producers.current.screen.id);
            producers.current.screen = null;
        }
        setLocalParticipant((prev: any) => ({
            ...prev,
            streams: { ...prev.streams, screen: undefined }
        }));
        setIsScreenSharing(false);
    };

    const formatDuration = (s: number) => {
        const mins = Math.floor(s / 60);
        const secs = s % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    if (isMinimized) {
        return (
            <div className="fixed bottom-24 right-4 z-[100] bg-gaming-accent p-4 rounded-3xl shadow-[0_0_40px_rgba(0,223,130,0.3)] cursor-pointer group hover:scale-105 transition-all" onClick={() => setIsMinimized(false)}>
                <Zap size={24} className="text-black animate-pulse" />
                <div className="absolute -top-2 -right-2 bg-red-600 text-white text-[9px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-black">{participants.size + 1}</div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[100] bg-[#0c0c12] flex flex-col p-6 animate-in fade-in duration-500 overflow-hidden">
            {/* Background elements */}
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,_rgba(0,223,130,0.03)_0%,_transparent_70%)]"></div>
            <div className="absolute top-0 right-0 p-12 z-0 opacity-10 pointer-events-none">
                <Shield size={200} className="text-gaming-accent" />
            </div>

            {/* Header */}
            <div className="flex justify-between items-center mb-10 z-10">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gaming-accent/10 border border-gaming-accent/20 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(0,223,130,0.1)]">
                        <Users className="text-gaming-accent" size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter leading-tight">
                            {teamName} <span className="text-gaming-accent">Network</span>
                        </h2>
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-gaming-accent animate-pulse"></div>
                            <p className="text-[10px] text-gray-400 font-mono uppercase tracking-[0.3em]">Neural Link Stable // {formatDuration(duration)}</p>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setIsMinimized(true)} className="p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-colors">
                        <Minimize2 className="text-gray-400" size={20} />
                    </button>
                </div>
            </div>

            {/* Grid of Participants */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-fr z-10 overflow-y-auto pr-2 custom-scrollbar">
                <ParticipantCard participant={localParticipant} isLocal={true} />
                {Array.from(participants.values()).map((p: RemoteParticipant) => (
                    <ParticipantCard key={p.userId} participant={p} />
                ))}
            </div>

            {/* Controls Bar */}
            <div className="mt-10 flex justify-center items-center gap-4 md:gap-8 z-10">
                <div className="bg-black/40 backdrop-blur-xl border border-white/5 p-2 rounded-[2.5rem] flex items-center gap-4">
                    <button
                        onClick={toggleMic}
                        className={`w-14 h-14 rounded-full transition-all flex items-center justify-center ${isMuted ? 'bg-red-500/20 text-red-500 border border-red-500/30' : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'}`}
                    >
                        {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
                    </button>

                    <button
                        onClick={toggleVideo}
                        className={`w-14 h-14 rounded-full transition-all flex items-center justify-center ${isVideoOff ? 'bg-white/5 text-white hover:bg-white/10 border border-white/10' : 'bg-gaming-accent/20 text-gaming-accent border border-gaming-accent/30 shadow-[0_0_20px_rgba(0,223,130,0.2)]'}`}
                    >
                        {isVideoOff ? <VideoOff size={24} /> : <Video size={24} />}
                    </button>

                    <button
                        onClick={toggleScreenShare}
                        className={`w-14 h-14 rounded-full transition-all flex items-center justify-center ${!isScreenSharing ? 'bg-white/5 text-white hover:bg-white/10 border border-white/10' : 'bg-gaming-accent/20 text-gaming-accent border border-gaming-accent/30 shadow-[0_0_20px_rgba(0,223,130,0.2)]'}`}
                    >
                        <Monitor size={24} />
                    </button>

                    <div className="w-[1px] h-8 bg-white/10 mx-2"></div>

                    <button
                        onClick={onClose}
                        className="w-16 h-16 bg-red-600 text-white rounded-full shadow-[0_0_30px_rgba(220,38,38,0.4)] hover:scale-110 active:scale-95 transition-all flex items-center justify-center border-4 border-[#0c0c12]"
                    >
                        <PhoneOff size={28} />
                    </button>
                </div>
            </div>

            {/* Tactical Decor */}
            <div className="fixed bottom-6 left-6 text-white/5 font-mono text-[8px] tracking-[0.5em] pointer-events-none">
                PROTOCOL_ID: {teamId.slice(0, 8).toUpperCase()} // SFU_MODE: ACTIVE
            </div>
        </div>
    );
};

export default TeamCallOverlay;
