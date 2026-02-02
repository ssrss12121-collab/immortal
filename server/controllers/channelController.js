const Channel = require('../models/Channel');
const Guild = require('../models/Guild');
const GuildPost = require('../models/GuildPost');

// Get channel details
exports.getChannel = async (req, res) => {
    try {
        const { channelId } = req.params;

        const channel = await Channel.findById(channelId)
            .populate('guildId', 'name customLink logoUrl')
            .populate('adminUserIds', 'username ign avatar avatarUrl')
            .populate('permissions.canPost', 'username ign avatar avatarUrl');

        if (!channel) {
            return res.status(404).json({ success: false, message: 'Channel not found' });
        }

        res.json({ success: true, channel });
    } catch (error) {
        console.error('Get channel error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to get channel',
            error: error.message 
        });
    }
};

// Edit channel (name, description)
exports.editChannel = async (req, res) => {
    try {
        const { channelId } = req.params;
        const { name, description } = req.body;
        const userId = req.user.id;

        const channel = await Channel.findById(channelId);
        if (!channel) {
            return res.status(404).json({ success: false, message: 'Channel not found' });
        }

        const guild = await Guild.findById(channel.guildId);
        if (!guild) {
            return res.status(404).json({ success: false, message: 'Guild not found' });
        }

        // Check permission
        if (!guild.hasPermission(userId, 'canEditChannels') && 
            guild.ownerId.toString() !== userId) {
            return res.status(403).json({ 
                success: false, 
                message: 'You do not have permission to edit this channel' 
            });
        }

        if (name) channel.name = name;
        if (description !== undefined) channel.description = description;

        await channel.save();

        res.json({ 
            success: true, 
            message: 'Channel updated successfully',
            channel 
        });
    } catch (error) {
        console.error('Edit channel error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to edit channel',
            error: error.message 
        });
    }
};

// Add admin to channel
exports.addChannelAdmin = async (req, res) => {
    try {
        const { channelId } = req.params;
        const { userId: targetUserId } = req.body;
        const currentUserId = req.user.id;

        const channel = await Channel.findById(channelId);
        if (!channel) {
            return res.status(404).json({ success: false, message: 'Channel not found' });
        }

        const guild = await Guild.findById(channel.guildId);
        if (!guild) {
            return res.status(404).json({ success: false, message: 'Guild not found' });
        }

        // Check permission
        if (!guild.hasPermission(currentUserId, 'canEditChannels') && 
            guild.ownerId.toString() !== currentUserId) {
            return res.status(403).json({ 
                success: false, 
                message: 'You do not have permission to manage channel admins' 
            });
        }

        // Check if target user is guild member
        if (!guild.getMember(targetUserId)) {
            return res.status(400).json({ 
                success: false, 
                message: 'User is not a member of this guild' 
            });
        }

        channel.addAdmin(targetUserId);
        await channel.save();

        res.json({ 
            success: true, 
            message: 'Channel admin added successfully',
            channel 
        });
    } catch (error) {
        console.error('Add channel admin error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to add admin',
            error: error.message 
        });
    }
};

// Remove admin/posting rights
exports.removeChannelPermission = async (req, res) => {
    try {
        const { channelId } = req.params;
        const { userId: targetUserId, permissionType } = req.body; // permissionType: 'admin', 'post', 'edit', 'delete'
        const currentUserId = req.user.id;

        const channel = await Channel.findById(channelId);
        if (!channel) {
            return res.status(404).json({ success: false, message: 'Channel not found' });
        }

        const guild = await Guild.findById(channel.guildId);
        if (!guild) {
            return res.status(404).json({ success: false, message: 'Guild not found' });
        }

        // Check permission
        if (!guild.hasPermission(currentUserId, 'canEditChannels') && 
            guild.ownerId.toString() !== currentUserId) {
            return res.status(403).json({ 
                success: false, 
                message: 'You do not have permission to manage channel permissions' 
            });
        }

        // Remove from appropriate permission array
        if (permissionType === 'admin') {
            channel.adminUserIds = channel.adminUserIds.filter(id => id.toString() !== targetUserId);
        } else if (permissionType === 'post') {
            channel.permissions.canPost = channel.permissions.canPost.filter(id => id.toString() !== targetUserId);
        } else if (permissionType === 'edit') {
            channel.permissions.canEditMessages = channel.permissions.canEditMessages.filter(id => id.toString() !== targetUserId);
        } else if (permissionType === 'delete') {
            channel.permissions.canDeleteMembers = channel.permissions.canDeleteMembers.filter(id => id.toString() !== targetUserId);
        }

        await channel.save();

        res.json({ 
            success: true, 
            message: 'Permission removed successfully',
            channel 
        });
    } catch (error) {
        console.error('Remove channel permission error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to remove permission',
            error: error.message 
        });
    }
};

// Get channel posts
exports.getChannelPosts = async (req, res) => {
    try {
        const { channelId } = req.params;
        const { limit = 20, skip = 0 } = req.query;

        const channel = await Channel.findById(channelId);
        if (!channel) {
            return res.status(404).json({ success: false, message: 'Channel not found' });
        }

        const posts = await GuildPost.find({ 
            channelId,
            isActive: true 
        })
        .populate('authorId', 'username ign avatar avatarUrl')
        .sort({ isPinned: -1, createdAt: -1 })
        .limit(parseInt(limit))
        .skip(parseInt(skip));

        res.json({ success: true, posts });
    } catch (error) {
        console.error('Get channel posts error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to get posts',
            error: error.message 
        });
    }
};

// Create a post in channel
exports.createChannelPost = async (req, res) => {
    try {
        const { channelId } = req.params;
        const { content, mediaUrls } = req.body;
        const userId = req.user.id;

        const channel = await Channel.findById(channelId);
        if (!channel) {
            return res.status(404).json({ success: false, message: 'Channel not found' });
        }

        // Check if user can post
        if (!channel.canUserPost(userId)) {
            return res.status(403).json({ 
                success: false, 
                message: 'You do not have permission to post in this channel' 
            });
        }

        const post = new GuildPost({
            guildId: channel.guildId,
            channelId,
            authorId: userId,
            content,
            mediaUrls: mediaUrls || []
        });

        await post.save();

        // Update channel stats
        channel.totalPosts++;
        await channel.save();

        // Update guild stats
        await Guild.findByIdAndUpdate(channel.guildId, { $inc: { totalPosts: 1 } });

        res.status(201).json({ 
            success: true, 
            message: 'Post created successfully',
            post 
        });
    } catch (error) {
        console.error('Create channel post error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to create post',
            error: error.message 
        });
    }
};

// Delete channel
exports.deleteChannel = async (req, res) => {
    try {
        const { channelId } = req.params;
        const userId = req.user.id;

        const channel = await Channel.findById(channelId);
        if (!channel) {
            return res.status(404).json({ success: false, message: 'Channel not found' });
        }

        const guild = await Guild.findById(channel.guildId);
        if (!guild) {
            return res.status(404).json({ success: false, message: 'Guild not found' });
        }

        // Only guild owner can delete channels
        if (guild.ownerId.toString() !== userId) {
            return res.status(403).json({ 
                success: false, 
                message: 'Only guild owner can delete channels' 
            });
        }

        channel.isActive = false;
        await channel.save();

        // Remove from guild's channels array
        guild.channels = guild.channels.filter(id => id.toString() !== channelId);
        await guild.save();

        res.json({ 
            success: true, 
            message: 'Channel deleted successfully' 
        });
    } catch (error) {
        console.error('Delete channel error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to delete channel',
            error: error.message 
        });
    }
};

module.exports = exports;
