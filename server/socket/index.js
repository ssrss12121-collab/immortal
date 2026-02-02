const jwt = require('jsonwebtoken');
const chatController = require('../controllers/chatController');
const guildHandler = require('./guildHandler');
const liveHandler = require('./liveHandler');
const socialHandler = require('./socialHandler');
const callHandler = require('./callHandler');
const mediasoupHandler = require('./mediasoupHandler');

// In-memory presence tracking
const onlineTeams = new Map(); // teamId -> Set of userIds

const socketHandler = (io) => {
    const broadcastPresence = (teamId) => {
        const onlineCount = onlineTeams.has(teamId) ? onlineTeams.get(teamId).size : 0;
        io.to(`team_${teamId}`).emit('team-online-count', { count: onlineCount });
    };

    // Authentication Middleware for Socket.IO
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) {
            return next(new Error('Authentication error: Token missing'));
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.user = decoded;
            next();
        } catch (err) {
            return next(new Error('Authentication error: Invalid token'));
        }
    });

    io.on('connection', (socket) => {
        // Ensure we collect the MongoDB ID even if passed as 'id' or '_id' in the token
        const userId = socket.user._id || socket.user.id;
        console.log(`⚡ Authenticated user connected: ${userId} (${socket.id})`);

        if (!userId) {
            console.error('❌ Connection error: User ID missing in token payload');
            return socket.disconnect();
        }

        // Join individual user room for direct updates
        socket.join(`user_${userId}`);

        // Track the teams this socket joins
        socket.joinedTeams = new Set();

        // Initialize Specialized Handlers
        guildHandler(io, socket);
        liveHandler(io, socket);
        socialHandler(io, socket);
        callHandler(io, socket);
        mediasoupHandler(io, socket);

        // Handle joining team rooms
        socket.on('join-team', (teamId) => {
            if (teamId) {
                socket.join(`team_${teamId}`);
                socket.joinedTeams.add(teamId);

                // Add to online presence
                if (!onlineTeams.has(teamId)) {
                    onlineTeams.set(teamId, new Set());
                }
                onlineTeams.get(teamId).add(userId);

                // Broadcast updated count
                broadcastPresence(teamId);

                // Notify others in the team for status dots
                socket.to(`team_${teamId}`).emit('user-presence-update', {
                    userId: userId,
                    status: 'online'
                });

                // Send current online list to the joined user
                socket.emit('team-online-list', Array.from(onlineTeams.get(teamId)));
            }
        });

        // Typing Indicators
        socket.on('typing', (data) => {
            socket.to(`team_${data.teamId}`).emit('user-typing', {
                senderName: data.senderName,
                userId: userId
            });
        });

        socket.on('stop-typing', (data) => {
            socket.to(`team_${data.teamId}`).emit('user-stop-typing', {
                userId: userId
            });
        });

        // Chat Handlers
        socket.on('send-team-message', async (data) => {
            // SECURITY: Override senderId from the authenticated socket session
            data.senderId = userId;

            // Validate teamId
            if (!data.teamId) {
                console.warn(`⚠️ Blocked message from ${userId}: teamId missing`);
                return;
            }

            const savedMsg = await chatController.saveMessage(data);
            if (savedMsg) {
                io.to(`team_${data.teamId}`).emit('team-message-received', savedMsg);
            }
        });

        socket.on('react-team-message', async (data) => {
            const updated = await chatController.toggleReaction(data.messageId, userId, data.senderName, data.emoji);
            if (updated) {
                io.to(`team_${data.teamId}`).emit('team-message-updated', updated);
            }
        });

        socket.on('edit-team-message', async (data) => {
            const updated = await chatController.updateMessage(data.messageId, data.text);
            if (updated) {
                io.to(`team_${data.teamId}`).emit('team-message-updated', updated);
            }
        });

        socket.on('delete-team-message', async (data) => {
            const success = await chatController.deleteMessage(data.messageId);
            if (success) {
                io.to(`team_${data.teamId}`).emit('team-message-deleted', data.messageId);
            }
        });

        // Disconnect logic
        socket.on('disconnect', () => {
            // Cleanup presence
            socket.joinedTeams.forEach(teamId => {
                const teamSet = onlineTeams.get(teamId);
                if (teamSet) {
                    teamSet.delete(userId);
                    if (teamSet.size === 0) {
                        onlineTeams.delete(teamId);
                    }

                    // Broadcast updated count
                    broadcastPresence(teamId);

                    // Notify others
                    io.to(`team_${teamId}`).emit('user-presence-update', {
                        userId: userId,
                        status: 'offline'
                    });
                }
            });
        });
    });
};

module.exports = socketHandler;
