const LiveSession = require('../models/LiveSession');
const Channel = require('../models/Channel');
const Group = require('../models/Group');

module.exports = (io, socket) => {
    const userId = socket.user._id || socket.user.id;

    // Join a live session room
    socket.on('join-live', async (sessionId) => {
        try {
            const session = await LiveSession.findById(sessionId);
            if (!session || session.status !== 'Live') return;

            socket.join(`live_${sessionId}`);
            
            // Add viewer to DB
            session.addViewer(userId);
            await session.save();

            // Notify room of new viewer count and peak
            io.to(`live_${sessionId}`).emit('session-stats-update', {
                viewersCount: session.viewersCount,
                peakViewers: session.peakViewers
            });

            // If it's a voice seated session, sync seats
            if (session.liveType === 'VoiceSeated') {
                socket.emit('voice-seats-sync', session.seats);
            }

            console.log(`👤 User ${userId} joined live session ${sessionId}`);
        } catch (error) {
            console.error('Socket join-live error:', error);
        }
    });

    // Leave a live session room
    socket.on('leave-live', async (sessionId) => {
        try {
            const session = await LiveSession.findById(sessionId);
            if (!session) return;

            socket.leave(`live_${sessionId}`);
            
            // Remove viewer from DB
            session.removeViewer(userId);
            await session.save();

            // Notify room
            io.to(`live_${sessionId}`).emit('session-stats-update', {
                viewersCount: session.viewersCount
            });
            
            console.log(`👤 User ${userId} left live session ${sessionId}`);
        } catch (error) {
            console.error('Socket leave-live error:', error);
        }
    });

    // Voice Seated: Join a seat
    socket.on('join-voice-seat', async (data) => {
        // data: { sessionId, position }
        try {
            const session = await LiveSession.findById(data.sessionId);
            if (!session || session.status !== 'Live' || session.liveType !== 'VoiceSeated') return;

            const success = session.joinSeat(userId, data.position);
            if (success) {
                await session.save();
                
                // Broadcast seat update to room
                io.to(`live_${data.sessionId}`).emit('voice-seats-update', session.seats);
                
                // Track who joined where for signaling
                console.log(`🎙️ User ${userId} joined seat ${data.position} in session ${data.sessionId}`);
            }
        } catch (error) {
            console.error('Socket join-voice-seat error:', error);
        }
    });

    // Voice Seated: Leave a seat
    socket.on('leave-voice-seat', async (data) => {
        // data: { sessionId }
        try {
            const session = await LiveSession.findById(data.sessionId);
            if (!session) return;

            const success = session.leaveSeat(userId);
            if (success) {
                await session.save();
                io.to(`live_${data.sessionId}`).emit('voice-seats-update', session.seats);
                console.log(`🎙️ User ${userId} left seat in session ${data.sessionId}`);
            }
        } catch (error) {
            console.error('Socket leave-voice-seat error:', error);
        }
    });

    // Update mic/speaking status in voice seat
    socket.on('update-voice-status', async (data) => {
        // data: { sessionId, micActive, isSpeaking }
        try {
            const session = await LiveSession.findById(data.sessionId);
            if (!session || session.liveType !== 'VoiceSeated') return;

            const seat = session.seats.find(s => s.userId.toString() === userId);
            if (seat) {
                if (data.micActive !== undefined) seat.micActive = data.micActive;
                if (data.isSpeaking !== undefined) seat.isSpeaking = data.isSpeaking;
                
                await session.save();
                io.to(`live_${data.sessionId}`).emit('voice-seats-update', session.seats);
            }
        } catch (error) {
            console.error('Socket update-voice-status error:', error);
        }
    });

    // Signaling for WebRTC (simplified for now, usually peer-to-peer or SFU)
    socket.on('live-signal', (data) => {
        // data: { sessionId, targetUserId, signal }
        if (data.targetUserId) {
            io.to(`user_${data.targetUserId}`).emit('live-signal', {
                from: userId,
                signal: data.signal,
                sessionId: data.sessionId
            });
        } else {
            // Room broadcast for mesh/general signals
            socket.to(`live_${data.sessionId}`).emit('live-signal', {
                from: userId,
                signal: data.signal,
                sessionId: data.sessionId
            });
        }
    });

    // Handle Reactions
    socket.on('send-live-reaction', async (data) => {
        // data: { sessionId, type }
        try {
            const session = await LiveSession.findById(data.sessionId);
            if (!session || !session.allowReactions) return;

            session.addReaction(userId, data.type);
            await session.save();

            // Broadcast reaction to room
            io.to(`live_${data.sessionId}`).emit('live-reaction-received', {
                userId,
                type: data.type,
                reactionCounts: session.reactionCounts
            });
        } catch (error) {
            console.error('Socket send-live-reaction error:', error);
        }
    });

    // Live Comments
    socket.on('send-live-comment', (data) => {
        // data: { sessionId, text, senderName }
        io.to(`live_${data.sessionId}`).emit('live-comment-received', {
            userId,
            senderName: data.senderName,
            text: data.text,
            timestamp: new Date()
        });
    });

    // Broadcast live started/ended to guild/channel rooms
    // These are usually triggered from the controller after DB save
    // But we can add listeners here if the client needs to explicitly emit
    
    socket.on('guild-live-start', (data) => {
        // data: { guildId, sessionId, title, liveType }
        io.to(`guild_${data.guildId}`).emit('guild-live-notification', {
            type: 'START',
            ...data
        });
    });

    socket.on('channel-live-start', (data) => {
        // data: { channelId, sessionId, title, liveType }
        io.to(`channel_${data.channelId}`).emit('channel-live-notification', {
            type: 'START',
            ...data
        });
    });
};
