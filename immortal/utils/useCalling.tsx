// FINAL REBUILD - Simplified, Reliable, Shared State
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { getSocket } from './socket';
import type { Socket } from 'socket.io-client';

export interface CallState {
    isCalling: boolean;
    isIncoming: boolean;
    remoteStream: MediaStream | null;
    localStream: MediaStream | null;
    peerId: string | null;
    peerName: string | null;
    peerAvatar: string | null;
    callType: 'video' | 'audio' | null;
    status: 'IDLE' | 'RINGING' | 'CONNECTING' | 'STABLE' | 'BUSY' | 'OFFLINE';
    isMuted: boolean;
    isVideoOff: boolean;
    isScreenSharing: boolean;
    remoteMuted: boolean;
    remoteVideoOff: boolean;
    remoteScreenSharing: boolean;
}

const CallContext = createContext<any>(null);

export const useCalling = () => {
    const context = useContext(CallContext);
    if (!context) {
        console.error('[useCalling] ❌ CRITICAL: Context is null! Ensure CallProvider wraps this component.');
        throw new Error('useCalling must be used within a CallProvider');
    }
    return context;
};

console.log('[useCalling] 🚀 VERSION 2.0 LOADED');

export const CallProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const pc = useRef<RTCPeerConnection | null>(null);
    const localStreamRef = useRef<MediaStream | null>(null);
    
    const [callState, setCallState] = useState<CallState>({
        isCalling: false,
        isIncoming: false,
        remoteStream: null,
        localStream: null,
        peerId: null,
        peerName: null,
        peerAvatar: null,
        callType: null,
        status: 'IDLE',
        isMuted: false,
        isVideoOff: false,
        isScreenSharing: false,
        remoteMuted: false,
        remoteVideoOff: false,
        remoteScreenSharing: false
    });

    // Initialize socket
    useEffect(() => {
        const checkSocket = setInterval(() => {
            const s = getSocket();
            if (s) {
                setSocket(s);
                clearInterval(checkSocket);
            }
        }, 500);
        return () => clearInterval(checkSocket);
    }, []);

    // RTCPeerConnection Helper
    const createPeerConnection = (targetUserId: string) => {
        if (pc.current) pc.current.close();

        const connection = new RTCPeerConnection({
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' },
                { urls: 'stun:stun2.l.google.com:19302' },
                { urls: 'stun:stun.services.mozilla.com' }
            ],
            iceCandidatePoolSize: 10
        });

        connection.onicecandidate = ({ candidate }) => {
            if (candidate && socket) {
                socket.emit('candidate-private-call', { targetUserId, candidate });
            }
        };

        connection.ontrack = (event) => {
            const trackKind = event.track.kind;
            console.log(`[WebRTC] 📩 Received remote ${trackKind} track:`, event.track.id);
            console.log('[WebRTC] Track state:', {
                enabled: event.track.enabled,
                muted: event.track.muted,
                readyState: event.track.readyState
            });
            
            if (event.streams && event.streams[0]) {
                const stream = event.streams[0];
                console.log('[WebRTC] Stream info:', {
                    id: stream.id,
                    audioTracks: stream.getAudioTracks().length,
                    videoTracks: stream.getVideoTracks().length
                });
                
                // ⭐ CRITICAL: Always update remote stream when new track arrives
                // This ensures mid-call video addition works
                setCallState(prev => {
                    const currentRemote = prev.remoteStream;
                    
                    // If same stream ID, just trigger re-render
                    if (currentRemote?.id === stream.id) {
                        console.log('[WebRTC] ✅ Updated existing remote stream with new track');
                        return { ...prev, remoteStream: stream };
                    }
                    
                    // New stream entirely
                    console.log('[WebRTC] ✅ Setting new remote stream');
                    return { ...prev, remoteStream: stream };
                });
            } else {
                console.warn('[WebRTC] ⚠️ Track received but no stream attached!');
            }
        };

        connection.oniceconnectionstatechange = () => {
            if (connection.iceConnectionState === 'failed' || connection.iceConnectionState === 'disconnected') {
                connection.restartIce();
            }
        };

        connection.onconnectionstatechange = () => {
            if (connection.connectionState === 'connected') {
                setCallState(prev => ({ ...prev, status: 'STABLE' }));
            }
        };

        pc.current = connection;
        return connection;
    };

    const initiateCall = async (targetUserId: string, targetUserName: string, type: 'video' | 'audio') => {
        console.log(`[Call] 📞 Initiating ${type} call to ${targetUserName}`);
        
        setCallState(prev => ({
            ...prev,
            isCalling: true,
            isIncoming: false,
            peerId: targetUserId,
            peerName: targetUserName,
            callType: type,
            status: 'CONNECTING',
            isVideoOff: type === 'audio' // Video calls start with camera ON, audio calls with camera OFF
        }));

        try {
            // VIDEO CALLS: Start with both audio AND video
            // AUDIO CALLS: Start with audio only (user can enable camera manually)
            const constraints = type === 'video' 
                ? { 
                    audio: true, 
                    video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } } 
                  }
                : { 
                    audio: true, 
                    video: false 
                  };
            
            console.log('[Call] Media constraints:', JSON.stringify(constraints, null, 2));
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            
            console.log(`[Call] ✅ ${type === 'video' ? 'Audio + Video' : 'Audio only'} stream obtained`);
            console.log('[Call] Stream tracks:', stream.getTracks().map(t => `${t.kind} (enabled: ${t.enabled}, readyState: ${t.readyState})`));
            
            // ⭐ CRITICAL: Verify video track exists for video calls
            if (type === 'video') {
                const videoTracks = stream.getVideoTracks();
                if (videoTracks.length === 0) {
                    console.error('[Call] ❌ CRITICAL: No video track received despite video call!');
                    alert('Camera not available. Please check camera permissions and ensure no other app is using the camera.');
                    stream.getTracks().forEach(t => t.stop());
                    cleanup();
                    return;
                }
                
                const videoTrack = videoTracks[0];
                console.log('[Call] 📹 Video track verified:', {
                    id: videoTrack.id,
                    label: videoTrack.label,
                    enabled: videoTrack.enabled,
                    readyState: videoTrack.readyState,
                    settings: videoTrack.getSettings()
                });
                
                // Ensure video track is enabled
                videoTrack.enabled = true;
            }

            localStreamRef.current = stream;
            setCallState(prev => ({ ...prev, localStream: stream }));

            const connection = createPeerConnection(targetUserId);
            stream.getTracks().forEach(track => {
                track.enabled = true;
                console.log('[WebRTC] Adding local track:', track.kind, 'enabled:', track.enabled);
                connection.addTrack(track, stream);
            });

            const offer = await connection.createOffer();
            await connection.setLocalDescription(offer);
            
            console.log('[Call] 📤 Sending call offer');

            if (socket) {
                socket.emit('initiate-private-call', { targetUserId, type, signal: offer });
            }
        } catch (err: any) {
            console.error('[Call] ❌ Failed:', err.name, err.message);
            if (err.name === 'NotAllowedError') {
                alert('Camera/microphone permission denied. Please allow access and try again.');
            } else if (err.name === 'NotFoundError') {
                alert('No camera/microphone found. Please check your devices.');
            } else if (err.name === 'NotReadableError') {
                alert('Camera is being used by another application. Please close other apps and try again.');
            } else {
                alert(`Call failed: ${err.message}`);
            }
            cleanup();
        }
    };

    const acceptCall = async () => {
        if (!callState.peerId || !pc.current) return;

        try {
            console.log(`[Call] 📞 Accepting ${callState.callType} call`);
            console.log('[Call] 🎥 Requesting audio-only permission (camera off by default)...');
            
            // ALWAYS start with audio only - camera can be enabled later
            const constraints = {
                audio: true,
                video: false // Start without video
            };
            
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            
            console.log('[Call] ✅ Audio stream obtained (video off by default)');
            console.log('[Call] Stream tracks:', stream.getTracks().map(t => `${t.kind} (enabled: ${t.enabled})`));

            localStreamRef.current = stream;
            // Create fresh reference for React reactivity
            const freshStream = new MediaStream(stream.getTracks());
            setCallState(prev => ({ ...prev, localStream: freshStream, isIncoming: false, isVideoOff: true }));

            stream.getTracks().forEach(track => {
                track.enabled = true;
                console.log('[WebRTC] Adding local track on accept:', track.kind, 'enabled:', track.enabled);
                pc.current?.addTrack(track, stream);
            });
            
            console.log('[Call] 💡 Tip: Click camera button to enable video');

            const answer = await pc.current.createAnswer();
            await pc.current.setLocalDescription(answer);
            
            console.log('[Call] 📤 Sending call answer');

            if (socket) {
                socket.emit('accept-private-call', { targetUserId: callState.peerId, signal: answer });
            }
        } catch (err: any) {
            console.error('[Call] ❌ Accept failed:', err.name, err.message);
            if (err.name === 'NotAllowedError') {
                alert('Camera/microphone permission denied. Please allow access and try again.');
            }
            cleanup();
        }
    };

    const rejectCall = () => {
        if (callState.peerId && socket) socket.emit('reject-private-call', { targetUserId: callState.peerId });
        cleanup();
    };

    const endCall = () => {
        if (callState.peerId && socket) socket.emit('end-private-call', { targetUserId: callState.peerId });
        cleanup();
    };

    const cleanup = () => {
        localStreamRef.current?.getTracks().forEach(t => t.stop());
        pc.current?.close();
        pc.current = null;
        localStreamRef.current = null;

        setCallState({
            isCalling: false,
            isIncoming: false,
            remoteStream: null,
            localStream: null,
            peerId: null,
            peerName: null,
            peerAvatar: null,
            callType: null,
            status: 'IDLE',
            isMuted: false,
            isVideoOff: false,
            isScreenSharing: false,
            remoteMuted: false,
            remoteVideoOff: false,
            remoteScreenSharing: false
        });
    };

    const toggleMute = () => {
        if (localStreamRef.current) {
            const track = localStreamRef.current.getAudioTracks()[0];
            if (track) {
                track.enabled = !track.enabled;
                setCallState(prev => ({ ...prev, isMuted: !track.enabled }));
                if (socket && callState.peerId) {
                    socket.emit('call-state-update', { targetUserId: callState.peerId, isMuted: !track.enabled });
                }
            }
        }
    };

    const toggleVideo = async () => {
        if (localStreamRef.current) {
            const track = localStreamRef.current.getVideoTracks()[0];
            if (track) {
                // If track exists, just toggle it
                track.enabled = !track.enabled;
                console.log('[Video] Toggle:', track.enabled ? 'ON' : 'OFF');
                
                // Force reference update to trigger UI re-bind
                const updatedStream = new MediaStream(localStreamRef.current.getTracks());
                setCallState(prev => ({ 
                    ...prev, 
                    localStream: updatedStream,
                    isVideoOff: !track.enabled 
                }));

                if (socket && callState.peerId) {
                    socket.emit('call-state-update', { targetUserId: callState.peerId, isVideoOff: !track.enabled });
                }
            } else {
                // No video track - need to enable camera first
                console.log('[Video] No video track, enabling camera...');
                await enableCamera();
            }
        } else {
            console.warn('[Video] No local stream found');
        }
    };

    const startScreenShare = async () => {
        if (!pc.current) return;
        try {
            const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
            const screenTrack = screenStream.getVideoTracks()[0];
            const sender = pc.current.getSenders().find(s => s.track?.kind === 'video');
            if (sender) await sender.replaceTrack(screenTrack);
            
            screenTrack.onended = stopScreenShare;
            setCallState(prev => ({ ...prev, isScreenSharing: true }));
            if (socket && callState.peerId) {
                socket.emit('call-state-update', { targetUserId: callState.peerId, isScreenSharing: true });
            }
        } catch (err) { console.error(err); }
    };

    const stopScreenShare = async () => {
        if (!pc.current) return;
        try {
            const cameraStream = await navigator.mediaDevices.getUserMedia({ video: true });
            const cameraTrack = cameraStream.getVideoTracks()[0];
            const sender = pc.current.getSenders().find(s => s.track?.kind === 'video');
            if (sender) await sender.replaceTrack(cameraTrack);
            
            setCallState(prev => ({ ...prev, isScreenSharing: false }));
            if (socket && callState.peerId) {
                socket.emit('call-state-update', { targetUserId: callState.peerId, isScreenSharing: false });
            }
        } catch (err) { console.error(err); }
    };

    const enableCamera = async () => {
        if (!pc.current) {
            console.error('[Camera] No peer connection');
            return;
        }
        
        try {
            console.log('[Camera] 🎥 Requesting camera permission...');
            
            const videoStream = await navigator.mediaDevices.getUserMedia({
                video: { 
                    facingMode: 'user', 
                    width: { ideal: 1280 }, 
                    height: { ideal: 720 } 
                }
            });
            
            const videoTrack = videoStream.getVideoTracks()[0];
            console.log('[Camera] ✅ Video track obtained:', videoTrack.label);

            // Add video track to local stream
            if (localStreamRef.current) {
                // Remove old video track if exists
                const oldVideoTrack = localStreamRef.current.getVideoTracks()[0];
                if (oldVideoTrack) {
                    localStreamRef.current.removeTrack(oldVideoTrack);
                    oldVideoTrack.stop();
                }
                
                localStreamRef.current.addTrack(videoTrack);
                console.log('[Camera] Video track added to local stream');
            } else {
                localStreamRef.current = new MediaStream([videoTrack]);
            }

            // Create a NEW MediaStream instance to force state change and effect trigger
            const updatedStream = new MediaStream(localStreamRef.current.getTracks());

            // Add to peer connection (this will trigger renegotiation)
            const sender = pc.current.getSenders().find(s => s.track?.kind === 'video');
            if (sender) {
                // Replace existing video track
                await sender.replaceTrack(videoTrack);
                console.log('[Camera] Video track replaced in sender');
            } else {
                // Add new video track
                pc.current.addTrack(videoTrack, updatedStream);
                console.log('[Camera] Video track added to peer connection');
            }

            // Update state BEFORE renegotiation
            setCallState(prev => ({ 
                ...prev, 
                localStream: updatedStream,
                isVideoOff: false,
                callType: 'video'
            }));

            // ⭐ CRITICAL: Renegotiate to send video track to remote peer
            if (socket && callState.peerId) {
                console.log('[Camera] 🔄 Starting renegotiation...');
                
                // Create new offer with video
                const offer = await pc.current.createOffer();
                await pc.current.setLocalDescription(offer);
                
                // Send renegotiation OFFER to peer (separate from answer)
                socket.emit('renegotiate-offer', {
                    targetUserId: callState.peerId,
                    sdp: offer
                });
                
                // Notify peer about video state
                socket.emit('call-state-update', { 
                    targetUserId: callState.peerId, 
                    isVideoOff: false,
                    callType: 'video'
                });
                
                console.log('[Camera] 🎉 Renegotiation offer sent!');
            }
            
            console.log('[Camera] ✅ Camera enabled successfully!');
        } catch (err: any) { 
            console.error('[Camera] ❌ Failed:', err.name, err.message);
            if (err.name === 'NotAllowedError') {
                alert('Camera permission denied. Please allow camera access.');
            } else if (err.name === 'NotReadableError') {
                alert('Camera is already in use by another application. Please close other apps using the camera.');
            } else {
                alert(`Camera error: ${err.message}`);
            }
        }
    };

    const switchCamera = async () => {
        if (!pc.current || !localStreamRef.current) return;
        try {
            const currentTrack = localStreamRef.current.getVideoTracks()[0];
            const currentFacing = currentTrack?.getSettings().facingMode || 'user';
            const newFacing = currentFacing === 'user' ? 'environment' : 'user';

            const newStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: newFacing, width: 1280, height: 720 }
            });
            const newTrack = newStream.getVideoTracks()[0];

            if (currentTrack) {
                currentTrack.stop();
                localStreamRef.current.removeTrack(currentTrack);
            }
            localStreamRef.current.addTrack(newTrack);

            const videoSender = pc.current.getSenders().find(s => s.track?.kind === 'video');
            if (videoSender) await videoSender.replaceTrack(newTrack);

            setCallState(prev => ({ ...prev, localStream: localStreamRef.current }));
        } catch (err) { console.error('[Camera] Switch failed:', err); }
    };

    // Socket listeners
    useEffect(() => {
        if (!socket) return;
        
        const onIncoming = (data: any) => {
            if (callState.isCalling) {
                socket.emit('busy-private-call', { targetUserId: data.callerId });
                return;
            }
            setCallState({
                ...callState,
                isCalling: true,
                isIncoming: true,
                peerId: data.callerId,
                peerName: data.callerName,
                peerAvatar: data.callerAvatar,
                callType: data.type,
                status: 'RINGING'
            });
            const connection = createPeerConnection(data.callerId);
            connection.setRemoteDescription(new RTCSessionDescription(data.signal));
        };

        const onAccepted = (data: any) => {
            pc.current?.setRemoteDescription(new RTCSessionDescription(data.signal));
            setCallState(prev => ({ ...prev, status: 'STABLE' }));
        };

        const onCandidate = (data: any) => {
            if (data.candidate && pc.current) pc.current.addIceCandidate(new RTCIceCandidate(data.candidate));
        };

        const onStateUpdate = (data: any) => {
            setCallState(prev => ({
                ...prev,
                remoteMuted: data.isMuted !== undefined ? data.isMuted : prev.remoteMuted,
                remoteVideoOff: data.isVideoOff !== undefined ? data.isVideoOff : prev.remoteVideoOff,
                remoteScreenSharing: data.isScreenSharing !== undefined ? data.isScreenSharing : prev.remoteScreenSharing
            }));
        };

        // ⭐ Renegotiation handler - PERFECT NEGOTIATION PATTERN
        // Handles simultaneous offers gracefully by using polite/impolite strategy
        const onRenegotiate = async (data: any) => {
            if (!pc.current) {
                console.error('[Renegotiation] ❌ No peer connection!');
                return;
            }
            
            try {
                const currentState = pc.current.signalingState;
                console.log('[Renegotiation] 🔄 Received offer from peer, current state:', currentState);
                
                // Determine if we're "polite" - the answerer/receiver is always polite
                const isPolite = !callState.isIncoming; // If we didn't initiate call, we're polite
                
                // Handle collision (both sides trying to renegotiate simultaneously)
                const offerCollision = currentState !== 'stable';
                
                if (offerCollision) {
                    console.warn('[Renegotiation] ⚠️ Offer collision detected!', {
                        currentState,
                        isPolite
                    });
                    
                    if (isPolite) {
                        // Polite peer: rollback and accept remote offer
                        console.log('[Renegotiation] 🤝 Being polite - rolling back local offer');
                        
                        // Rollback to stable state
                        await pc.current.setLocalDescription({type: 'rollback'} as any);
                        console.log('[Renegotiation] ✅ Rolled back to stable');
                    } else {
                        // Impolite peer: ignore incoming offer and continue with ours
                        console.log('[Renegotiation] 💪 Being impolite - ignoring incoming offer');
                        return;
                    }
                }
                
                // Now we should be stable (or polite peer after rollback)
                await pc.current.setRemoteDescription(new RTCSessionDescription(data.sdp));
                console.log('[Renegotiation] ✅ Remote description set');
                
                const answer = await pc.current.createAnswer();
                await pc.current.setLocalDescription(answer);
                console.log('[Renegotiation] ✅ Answer created and set as local description');
                
                if (socket && callState.peerId) {
                    // Send answer with different event to avoid confusion with offer
                    socket.emit('renegotiate-answer', {
                        targetUserId: callState.peerId,
                        sdp: answer
                    });
                    console.log('[Renegotiation] ✅ Answer sent to peer');
                }
            } catch (err: any) {
                console.error('[Renegotiation] ❌ Failed:', err.name, err.message);
                console.error('[Renegotiation] State was:', pc.current?.signalingState);
            }
        };

        // ⭐ Renegotiation answer handler - receives answer after sending offer
        const onRenegotiateAnswer = async (data: any) => {
            if (!pc.current) return;
            try {
                console.log('[Renegotiation] 📨 Received answer from peer');
                await pc.current.setRemoteDescription(new RTCSessionDescription(data.sdp));
                console.log('[Renegotiation] ✅ Answer applied successfully');
            } catch (err: any) {
                console.error('[Renegotiation] ❌ Failed to apply answer:', err.name, err.message);
            }
        };

        socket.on('incoming-private-call', onIncoming);
        socket.on('private-call-accepted', onAccepted);
        socket.on('renegotiate-offer', onRenegotiate);  // Receive offer
        socket.on('renegotiate-answer', onRenegotiateAnswer);  // Receive answer
        socket.on('candidate-private-call', onCandidate);
        socket.on('private-call-state-updated', onStateUpdate);
        socket.on('private-call-rejected', cleanup);
        socket.on('private-call-ended', cleanup);
        socket.on('private-call-busy', () => { setCallState(prev => ({ ...prev, status: 'BUSY' })); setTimeout(cleanup, 2000); });
        socket.on('private-call-error', () => { setCallState(prev => ({ ...prev, status: 'OFFLINE' })); setTimeout(cleanup, 2000); });

        return () => {
            socket.off('incoming-private-call', onIncoming);
            socket.off('private-call-accepted', onAccepted);
            socket.off('renegotiate-offer', onRenegotiate);
            socket.off('renegotiate-answer', onRenegotiateAnswer);
            socket.off('candidate-private-call', onCandidate);
            socket.off('private-call-state-updated', onStateUpdate);
            socket.off('private-call-rejected', cleanup);
            socket.off('private-call-ended', cleanup);
            socket.off('private-call-busy');
        };
    }, [socket, callState.isCalling, callState.isIncoming]);

    return (
        <CallContext.Provider value={{
            callState,
            initiateCall,
            acceptCall,
            rejectCall,
            endCall,
            toggleMute,
            toggleVideo,
            enableCamera,
            startScreenShare,
            stopScreenShare,
            switchCamera
        }}>
            {children}
        </CallContext.Provider>
    );
};
