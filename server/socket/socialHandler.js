const Follow = require('../models/Follow');
const chatController = require('../controllers/chatController');

module.exports = (io, socket) => {
    const userId = socket.user._id || socket.user.id;

    // Presence Tracking
    socket.on('user-status-connected', async () => {
        // Broadcast online status to followers
        const followers = await Follow.find({ followingId: userId });
        followers.forEach(follow => {
            io.to(`user_${follow.followerId}`).emit('user-status-change', {
                userId,
                isOnline: true
            });
        });
    });

    socket.on('typing-status', (data) => {
        // data: { targetUserId: string, isTyping: boolean }
        io.to(`user_${data.targetUserId}`).emit('typing-indicator', {
            userId,
            isTyping: data.isTyping
        });
    });

    socket.on('send-private-message', async (data) => {
        // data: { targetUserId: string, text: string, image?: string, senderName: string }

        // Check if sender follows target (Social Restriction) - Removed for smoother UX
        // const isFollowing = await Follow.findOne({ followerId: userId, followingId: data.targetUserId });
        // if (!isFollowing) {
        //     return socket.emit('error', { message: "You must follow this operative to transmit data." });
        // }

        const savedMsg = await chatController.saveMessage({
            type: 'PRIVATE',
            targetUserId: data.targetUserId,
            senderId: userId,
            senderName: data.senderName || 'Operative',
            text: data.text,
            image: data.image,
            tempId: data.tempId
        });

        if (savedMsg) {
            io.to(`user_${data.targetUserId}`).emit('new-private-message', savedMsg);
            // Also notify sender for sync across devices if needed
            socket.emit('private-message-sent', savedMsg);
        }
    });

    socket.on('get-online-users', async () => {
        try {
            // In a real app, you'd check a Redis store or similar for global online status
            // For now, we'll return users who follow this user and are potentially active
            const following = await Follow.find({ followerId: userId }).populate('followingId');
            const onlineList = following
                .map(f => ({
                    id: f.followingId._id,
                    name: f.followingId.ign || f.followingId.username || 'Operative',
                    avatar: f.followingId.avatar || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${f.followingId._id}`,
                    isOnline: true // Mocking as online for the list demonstration
                }));
            socket.emit('online-users-list', onlineList);
        } catch (error) {
            console.error('Error fetching online users:', error);
            socket.emit('online-users-list', []);
        }
    });

    socket.on('disconnect', async () => {
        // Broadcast offline status to followers
        const followers = await Follow.find({ followingId: userId });
        followers.forEach(follow => {
            io.to(`user_${follow.followerId}`).emit('user-status-change', {
                userId,
                isOnline: false
            });
        });
    });
};
