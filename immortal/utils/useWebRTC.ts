import { useState, useEffect, useRef } from 'react';
import { getSocket } from './socket';

interface WebRTCOptions {
    sessionId: string;
    isHost: boolean;
    onRemoteStream: (stream: MediaStream) => void;
}

export const useWebRTC = ({ sessionId, isHost, onRemoteStream }: WebRTCOptions) => {
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remoteStreams, setRemoteStreams] = useState<{ [userId: string]: MediaStream }>({});
    const peerConnections = useRef<{ [userId: string]: RTCPeerConnection }>({});
    const socket = getSocket();

    useEffect(() => {
        if (!socket) return;
        
        const init = async () => {
            if (isHost) {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
                setLocalStream(stream);

                // Set up background audio persistence
                if ('mediaSession' in navigator) {
                    navigator.mediaSession.metadata = new MediaMetadata({
                        title: 'Immortal Zone Live',
                        artist: 'Live Stream Active',
                        album: 'Operational Broadcast'
                    });
                }
            }

            socket.emit('join-live', sessionId);
        };

        init();

        socket.on('webrtc-signal', async (data: { senderId: string, signal: any }) => {
            let pc = peerConnections.current[data.senderId];

            if (!pc) {
                pc = createPeerConnection(data.senderId);
                peerConnections.current[data.senderId] = pc;
            }

            if (data.signal.type === 'offer') {
                await pc.setRemoteDescription(new RTCSessionDescription(data.signal));
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);
                if (socket) socket.emit('webrtc-answer', { targetUserId: data.senderId, answer, sessionId });
            } else if (data.signal.type === 'answer') {
                await pc.setRemoteDescription(new RTCSessionDescription(data.signal));
            } else if (data.signal.candidate) {
                await pc.addIceCandidate(new RTCIceCandidate(data.signal));
            }
        });

        return () => {
            if (socket) {
                socket.emit('leave-live', sessionId);
                socket.off('webrtc-signal');
            }
            localStream?.getTracks().forEach(track => track.stop());
            Object.values(peerConnections.current).forEach(pc => (pc as RTCPeerConnection).close());
        };
    }, []);

    const createPeerConnection = (userId: string) => {
        const pc = new RTCPeerConnection({
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
        });

        pc.onicecandidate = (event) => {
            if (event.candidate && socket) {
                socket.emit('ice-candidate', { targetUserId: userId, candidate: event.candidate, sessionId });
            }
        };

        pc.ontrack = (event) => {
            setRemoteStreams(prev => ({ ...prev, [userId]: event.streams[0] }));
            if (onRemoteStream) onRemoteStream(event.streams[0]);
        };

        if (localStream) {
            localStream.getTracks().forEach(track => pc.addTrack(track, localStream));
        }

        return pc;
    };

    const toggleMic = (enabled: boolean) => {
        localStream?.getAudioTracks().forEach(track => track.enabled = enabled);
    };

    const toggleScreen = async (enabled: boolean) => {
        if (enabled) {
            try {
                const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
                const videoTrack = screenStream.getVideoTracks()[0];

                (Object.values(peerConnections.current) as RTCPeerConnection[]).forEach(pc => {
                    const sender = pc.getSenders().find(s => s.track?.kind === 'video');
                    if (sender) sender.replaceTrack(videoTrack);
                });

                videoTrack.onended = () => toggleScreen(false);
            } catch (err) {
                console.error("Screen share failed", err);
            }
        } else if (localStream) {
            const videoTrack = localStream.getVideoTracks()[0];
            (Object.values(peerConnections.current) as RTCPeerConnection[]).forEach(pc => {
                const sender = pc.getSenders().find(s => s.track?.kind === 'video');
                if (sender) sender.replaceTrack(videoTrack);
            });
        }
    };

    return { localStream, toggleMic, toggleScreen };
};
