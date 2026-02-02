const GuildPost = require('../models/GuildPost');
const Guild = require('../models/Guild');
const Channel = require('../models/Channel');

// Get a single post
exports.getPost = async (req, res) => {
    try {
        const { postId } = req.params;

        const post = await GuildPost.findById(postId)
            .populate('authorId', 'username ign avatar avatarUrl')
            .populate('guildId', 'name customLink logoUrl')
            .populate('channelId', 'name');

        if (!post || !post.isActive) {
            return res.status(404).json({ success: false, message: 'Post not found' });
        }

        res.json({ success: true, post });
    } catch (error) {
        console.error('Get post error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to get post',
            error: error.message 
        });
    }
};

// Edit post
exports.editPost = async (req, res) => {
    try {
        const { postId } = req.params;
        const { content, mediaUrls } = req.body;
        const userId = req.user.id;

        const post = await GuildPost.findById(postId);
        if (!post || !post.isActive) {
            return res.status(404).json({ success: false, message: 'Post not found' });
        }

        // Only author can edit
        if (post.authorId.toString() !== userId) {
            return res.status(403).json({ 
                success: false, 
                message: 'You can only edit your own posts' 
            });
        }

        if (content) post.content = content;
        if (mediaUrls) post.mediaUrls = mediaUrls;
        post.isEdited = true;

        await post.save();

        res.json({ 
            success: true, 
            message: 'Post updated successfully',
            post 
        });
    } catch (error) {
        console.error('Edit post error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to edit post',
            error: error.message 
        });
    }
};

// Delete post
exports.deletePost = async (req, res) => {
    try {
        const { postId } = req.params;
        const userId = req.user.id;

        const post = await GuildPost.findById(postId);
        if (!post || !post.isActive) {
            return res.status(404).json({ success: false, message: 'Post not found' });
        }

        const guild = await Guild.findById(post.guildId);
        if (!guild) {
            return res.status(404).json({ success: false, message: 'Guild not found' });
        }

        // Author, guild owner, or channel admin can delete
        const isAuthor = post.authorId.toString() === userId;
        const isOwner = guild.ownerId.toString() === userId;
        const canDelete = isAuthor || isOwner || guild.hasPermission(userId, 'canDeleteMembers');

        if (!canDelete) {
            return res.status(403).json({ 
                success: false, 
                message: 'You do not have permission to delete this post' 
            });
        }

        post.isActive = false;
        await post.save();

        // Update channel stats
        if (post.channelId) {
            await Channel.findByIdAndUpdate(post.channelId, { $inc: { totalPosts: -1 } });
        }

        // Update guild stats
        await Guild.findByIdAndUpdate(post.guildId, { $inc: { totalPosts: -1 } });

        res.json({ 
            success: true, 
            message: 'Post deleted successfully' 
        });
    } catch (error) {
        console.error('Delete post error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to delete post',
            error: error.message 
        });
    }
};

// Pin/Unpin post
exports.pinPost = async (req, res) => {
    try {
        const { postId } = req.params;
        const { shouldPin } = req.body;
        const userId = req.user.id;

        const post = await GuildPost.findById(postId);
        if (!post || !post.isActive) {
            return res.status(404).json({ success: false, message: 'Post not found' });
        }

        const guild = await Guild.findById(post.guildId);
        if (!guild) {
            return res.status(404).json({ success: false, message: 'Guild not found' });
        }

        // Only owner or admin with edit permission can pin
        const isOwner = guild.ownerId.toString() === userId;
        const canEdit = guild.hasPermission(userId, 'canEditChannels');

        if (!isOwner && !canEdit) {
            return res.status(403).json({ 
                success: false, 
                message: 'You do not have permission to pin posts' 
            });
        }

        post.isPinned = shouldPin !== undefined ? shouldPin : !post.isPinned;
        await post.save();

        res.json({ 
            success: true, 
            message: post.isPinned ? 'Post pinned' : 'Post unpinned',
            post 
        });
    } catch (error) {
        console.error('Pin post error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to pin post',
            error: error.message 
        });
    }
};

// Add reaction to post
exports.addReactionToPost = async (req, res) => {
    try {
        const { postId } = req.params;
        const { type } = req.body; // like, love, fire, clap, wow, angry, sad
        const userId = req.user.id;

        const post = await GuildPost.findById(postId);
        if (!post || !post.isActive) {
            return res.status(404).json({ success: false, message: 'Post not found' });
        }

        const existingReaction = post.reactions.find(r => r.userId.toString() === userId);

        if (existingReaction) {
            if (existingReaction.type === type) {
                // Remove reaction if same type
                post.removeReaction(userId, type);
                await post.save();
                return res.json({ 
                    success: true, 
                    message: 'Reaction removed',
                    reactionCounts: post.reactionCounts 
                });
            } else {
                // Change reaction type
                post.removeReaction(userId, existingReaction.type);
                post.addReaction(userId, type);
            }
        } else {
            post.addReaction(userId, type);
        }

        await post.save();

        res.json({ 
            success: true, 
            message: 'Reaction added',
            reactionCounts: post.reactionCounts 
        });
    } catch (error) {
        console.error('Add reaction error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to add reaction',
            error: error.message 
        });
    }
};

// Get guild announcements (posts without channelId)
exports.getGuildAnnouncements = async (req, res) => {
    try {
        const { guildId } = req.params;
        const { limit = 10, skip = 0 } = req.query;

        const posts = await GuildPost.find({ 
            guildId,
            channelId: null,
            isActive: true 
        })
        .populate('authorId', 'username ign avatar avatarUrl')
        .sort({ isPinned: -1, createdAt: -1 })
        .limit(parseInt(limit))
        .skip(parseInt(skip));

        res.json({ success: true, posts });
    } catch (error) {
        console.error('Get announcements error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to get announcements',
            error: error.message 
        });
    }
};

// Create guild announcement (only owner/admin)
exports.createAnnouncement = async (req, res) => {
    try {
        const { guildId } = req.params;
        const { content, mediaUrls } = req.body;
        const userId = req.user.id;

        const guild = await Guild.findById(guildId);
        if (!guild) {
            return res.status(404).json({ success: false, message: 'Guild not found' });
        }

        // Only owner or admin can create announcements
        const isOwner = guild.ownerId.toString() === userId;
        const canPost = guild.hasPermission(userId, 'canPostInChannels');

        if (!isOwner && !canPost) {
            return res.status(403).json({ 
                success: false, 
                message: 'You do not have permission to create announcements' 
            });
        }

        const post = new GuildPost({
            guildId,
            channelId: null, // No channel means it's an announcement
            authorId: userId,
            content,
            mediaUrls: mediaUrls || []
        });

        await post.save();

        // Update guild stats
        guild.totalPosts++;
        await guild.save();

        res.status(201).json({ 
            success: true, 
            message: 'Announcement created successfully',
            post 
        });
    } catch (error) {
        console.error('Create announcement error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to create announcement',
            error: error.message 
        });
    }
};

module.exports = exports;
