const Guild = require('../models/Guild');
const Channel = require('../models/Channel');
const Group = require('../models/Group');
const GuildPost = require('../models/GuildPost');

module.exports = (io, socket) => {
    const userId = socket.user._id || socket.user.id;

    // Join guild room for notifications
    socket.on('join-guild-room', (guildId) => {
        socket.join(`guild_${guildId}`);
        console.log(`🏰 User ${userId} joined guild room ${guildId}`);
    });

    // Leave guild room
    socket.on('leave-guild-room', (guildId) => {
        socket.leave(`guild_${guildId}`);
    });

    // Join channel room
    socket.on('join-channel', (channelId) => {
        socket.join(`channel_${channelId}`);
        console.log(`📺 User ${userId} joined channel ${channelId}`);
    });

    // Leave channel room
    socket.on('leave-channel', (channelId) => {
        socket.leave(`channel_${channelId}`);
    });

    // Join group room
    socket.on('join-group', (groupId) => {
        socket.join(`group_${groupId}`);
        console.log(`👥 User ${userId} joined group ${groupId}`);
    });

    // Leave group room
    socket.on('leave-group', (groupId) => {
        socket.leave(`group_${groupId}`);
    });

    // Channel Messages (with permission check)
    socket.on('send-channel-message', async (data) => {
        // data: { channelId, text, senderName }
        try {
            const channel = await Channel.findById(data.channelId).populate('guildId');
            if (!channel) return;

            // Check if user can post
            const canPost = channel.canUserPost(userId);
            if (!canPost) {
                socket.emit('channel-message-error', { 
                    message: 'You do not have permission to post in this channel' 
                });
                return;
            }

            // Broadcast message to channel
            io.to(`channel_${data.channelId}`).emit('channel-message-received', {
                userId,
                senderName: data.senderName,
                text: data.text,
                timestamp: new Date()
            });
        } catch (error) {
            console.error('Channel message error:', error);
        }
    });

    // Group Messages (with permission check)
    socket.on('send-group-message', async (data) => {
        // data: { groupId, text, senderName }
        try {
            const group = await Group.findById(data.groupId);
            if (!group) return;

            // Check if user can post
            const canPost = group.canUserPost(userId);
            if (!canPost) {
                socket.emit('group-message-error', { 
                    message: 'You do not have permission to post in this group' 
                });
                return;
            }

            // Broadcast message to group
            io.to(`group_${data.groupId}`).emit('group-message-received', {
                userId,
                senderName: data.senderName,
                text: data.text,
                timestamp: new Date()
            });
        } catch (error) {
            console.error('Group message error:', error);
        }
    });

    // Typing indicators for channels
    socket.on('channel-typing', (data) => {
        socket.to(`channel_${data.channelId}`).emit('user-typing-channel', {
            userId,
            senderName: data.senderName
        });
    });

    socket.on('channel-stop-typing', (data) => {
        socket.to(`channel_${data.channelId}`).emit('user-stop-typing-channel', {
            userId
        });
    });

    // Typing indicators for groups
    socket.on('group-typing', (data) => {
        socket.to(`group_${data.groupId}`).emit('user-typing-group', {
            userId,
            senderName: data.senderName
        });
    });

    socket.on('group-stop-typing', (data) => {
        socket.to(`group_${data.groupId}`).emit('user-stop-typing-group', {
            userId
        });
    });

    // Guild Post Notifications (when new post is created)
    socket.on('guild-post-created', (data) => {
        // data: { guildId, postId, authorName, content }
        io.to(`guild_${data.guildId}`).emit('new-guild-post', data);
    });

    // Channel Post Notifications
    socket.on('channel-post-created', (data) => {
        // data: { channelId, postId, authorName, content }
        io.to(`channel_${data.channelId}`).emit('new-channel-post', data);
    });

    // Post Reaction Updates
    socket.on('post-reaction-added', (data) => {
        // data: { postId, guildId, channelId, reactionCounts }
        if (data.channelId) {
            io.to(`channel_${data.channelId}`).emit('post-reaction-update', data);
        } else if (data.guildId) {
            io.to(`guild_${data.guildId}`).emit('post-reaction-update', data);
        }
    });

    // Guild Member Joined
    socket.on('guild-member-joined', (data) => {
        // data: { guildId, userId, username }
        io.to(`guild_${data.guildId}`).emit('member-joined-notification', data);
    });

    // Guild Member Left
    socket.on('guild-member-left', (data) => {
        // data: { guildId, userId, username }
        io.to(`guild_${data.guildId}`).emit('member-left-notification', data);
    });

    // New Channel Created
    socket.on('channel-created', (data) => {
        // data: { guildId, channelId, channelName }
        io.to(`guild_${data.guildId}`).emit('new-channel-notification', data);
    });

    // New Group Created
    socket.on('group-created', (data) => {
        // data: { guildId, groupId, groupName, type }
        io.to(`guild_${data.guildId}`).emit('new-group-notification', data);
    });

    // Guild Update (name, description, logo changed)
    socket.on('guild-updated', (data) => {
        // data: { guildId, updates }
        io.to(`guild_${data.guildId}`).emit('guild-info-updated', data);
    });
};
