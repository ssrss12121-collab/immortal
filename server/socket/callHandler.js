const chatController = require('../controllers/chatController');
const activeCalls = new Map(); // Moved outside to be shared across socket instances

module.exports = (io, socket) => {
    const userId = socket.user._id || socket.user.id;

    // Direct Calling (1:1)
    socket.on('initiate-private-call', (data) => {
        // data: { targetUserId: string, type: 'video' | 'audio', signal: any }
        
        // Check if user is online
        const targetRoom = io.sockets.adapter.rooms.get(`user_${data.targetUserId}`);
        if (!targetRoom || targetRoom.size === 0) {
            socket.emit('private-call-error', { message: 'User is offline' });
            return;
        }

        io.to(`user_${data.targetUserId}`).emit('incoming-private-call', {
            callerId: userId,
            callerName: socket.user.ign || socket.user.username || 'Operative',
            callerAvatar: socket.user.avatar,
            type: data.type,
            signal: data.signal
        });

        // Initialize Call Tracking
        activeCalls.set(userId.toString(), {
            receiverId: data.targetUserId,
            type: data.type,
            status: 'initiating',
            startTime: null
        });
    });

    socket.on('ringing-private-call', (data) => {
        // data: { targetUserId: string } (targetUserId is the caller)
        io.to(`user_${data.targetUserId}`).emit('private-call-ringing', {
            responderId: userId
        });
    });

    socket.on('accept-private-call', (data) => {
        // data: { targetUserId: string, signal: any }
        const call = activeCalls.get(data.targetUserId.toString());
        if (call) {
            call.status = 'active';
            call.startTime = Date.now();
        }

        io.to(`user_${data.targetUserId}`).emit('private-call-accepted', {
            responderId: userId,
            responderName: socket.user.ign || socket.user.username || 'Operative',
            responderAvatar: socket.user.avatar,
            signal: data.signal
        });
    });

    socket.on('reject-private-call', (data) => {
        // data: { targetUserId: string }
        const call = activeCalls.get(data.targetUserId.toString());
        if (call) {
            chatController.saveCallLog({
                senderId: data.targetUserId,
                receiverId: userId,
                type: call.type,
                status: 'missed',
                duration: 0
            }).then(log => {
                if (log) {
                    io.to(`user_${data.targetUserId}`).to(`user_${userId}`).emit('new-private-message', log);
                }
            });
            activeCalls.delete(data.targetUserId.toString());
        }

        io.to(`user_${data.targetUserId}`).emit('private-call-rejected', {
            responderId: userId
        });
    });

    socket.on('busy-private-call', (data) => {
        // data: { targetUserId: string }
        io.to(`user_${data.targetUserId}`).emit('private-call-busy', {
            responderId: userId
        });
    });

    socket.on('end-private-call', (data) => {
        // data: { targetUserId: string }
        let call = activeCalls.get(userId.toString()); // I was caller
        let callerId = userId;
        let receiverId = data.targetUserId;

        if (!call) {
            call = activeCalls.get(data.targetUserId.toString()); // I was receiver
            callerId = data.targetUserId;
            receiverId = userId;
        }

        if (call) {
            const duration = call.startTime ? Math.floor((Date.now() - call.startTime) / 1000) : 0;
            chatController.saveCallLog({
                senderId: callerId,
                receiverId: receiverId,
                type: call.type,
                status: duration > 0 ? 'completed' : 'missed',
                duration: duration
            }).then(log => {
                if (log) {
                    io.to(`user_${callerId}`).to(`user_${receiverId}`).emit('new-private-message', log);
                }
            });
            activeCalls.delete(callerId.toString());
        }

        io.to(`user_${data.targetUserId}`).emit('private-call-ended', {
            endedBy: userId
        });
    });

    socket.on('disconnect', () => {
        // Cleanup active calls if disconnected
        for (const [callerId, call] of activeCalls.entries()) {
            if (callerId === userId.toString() || call.receiverId === userId.toString()) {
                const otherId = (callerId === userId.toString()) ? call.receiverId : callerId;
                const duration = call.startTime ? Math.floor((Date.now() - call.startTime) / 1000) : 0;
                
                chatController.saveCallLog({
                    senderId: callerId,
                    receiverId: call.receiverId,
                    type: call.type,
                    status: duration > 0 ? 'completed' : 'missed',
                    duration: duration
                }).then(log => {
                    if (log) {
                        io.to(`user_${callerId}`).to(`user_${call.receiverId}`).emit('new-private-message', log);
                    }
                });

                io.to(`user_${otherId}`).emit('private-call-ended', { endedBy: 'system' });
                activeCalls.delete(callerId);
                break;
            }
        }
    });

    // Renegotiation OFFER handler - relay offer to peer
    socket.on('renegotiate-offer', (data) => {
        // data: { targetUserId: string, sdp: RTCSessionDescription (offer) }
        console.log(`[CallHandler] 🔄 Relaying renegotiation OFFER from ${userId} to ${data.targetUserId}`);
        io.to(`user_${data.targetUserId}`).emit('renegotiate-offer', {
            senderId: userId,
            sdp: data.sdp
        });
    });

    // Renegotiation ANSWER handler - relay answer back to offering peer
    socket.on('renegotiate-answer', (data) => {
        // data: { targetUserId: string, sdp: RTCSessionDescription (answer) }
        console.log(`[CallHandler] 📨 Relaying renegotiation ANSWER from ${userId} to ${data.targetUserId}`);
        io.to(`user_${data.targetUserId}`).emit('renegotiate-answer', {
            senderId: userId,
            sdp: data.sdp
        });
    });

    socket.on('candidate-private-call', (data) => {
        // data: { targetUserId: string, candidate: RTCIceCandidate }
        console.log(`[CallHandler] Relaying ICE candidate from ${userId} to ${data.targetUserId}`);
        io.to(`user_${data.targetUserId}`).emit('candidate-private-call', {
            senderId: userId,
            candidate: data.candidate
        });
    });

    socket.on('call-state-update', (data) => {
        // data: { targetUserId: string, isMuted: boolean, isVideoOff: boolean, isScreenSharing: boolean }
        io.to(`user_${data.targetUserId}`).emit('private-call-state-updated', {
            senderId: userId,
            ...data
        });
    });

    // Group Calling
    socket.on('join-team-call', (data) => {
        // data: { teamId: string, signal: any }
        socket.join(`team_call_${data.teamId}`);
        socket.to(`team_call_${data.teamId}`).emit('new-peer-team-call', {
            peerId: userId,
            peerName: socket.user.ign || socket.user.username || 'Operative',
            signal: data.signal
        });
    });

    socket.on('signal-team-call', (data) => {
        // data: { teamId: string, targetPeerId: string, signal: any }
        io.to(`user_${data.targetPeerId}`).emit('team-call-signal', {
            senderId: userId,
            signal: data.signal
        });
    });

    socket.on('leave-team-call', (data) => {
        // data: { teamId: string }
        socket.leave(`team_call_${data.teamId}`);
        socket.to(`team_call_${data.teamId}`).emit('peer-left-team-call', {
            peerId: userId
        });
    });
};
