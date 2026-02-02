const Guild = require('../models/Guild');
const User = require('../models/User');
const Channel = require('../models/Channel');
const Group = require('../models/Group');

// Create a new guild with custom link
exports.createGuild = async (req, res) => {
    try {
        const { name, customLink, description, logoUrl, bannerUrl } = req.body;
        const userId = req.user.id;

        // Validate custom link format
        if (!customLink || !/^TR\.[a-zA-Z0-9_-]+$/.test(customLink)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid custom link. Must start with "TR." followed by alphanumeric characters' 
            });
        }

        // Check if custom link already exists
        const existingGuild = await Guild.findOne({ customLink });
        if (existingGuild) {
            return res.status(400).json({ 
                success: false, 
                message: 'This custom link is already taken' 
            });
        }

        // Create guild with owner having all permissions
        const guild = new Guild({
            name,
            customLink,
            description: description || '',
            logoUrl: logoUrl || `https://api.dicebear.com/7.x/shapes/svg?seed=${name}`,
            bannerUrl,
            ownerId: userId,
            members: [{
                userId,
                role: 'Owner',
                permissions: {
                    canPostInChannels: true,
                    canEditChannels: true,
                    canDeleteMembers: true,
                    canManageGroups: true,
                    canStartLive: true,
                    canCreateChannels: true,
                    canCreateGroups: true,
                    canManageAdmins: true
                }
            }]
        });

        await guild.save();

        // Auto-create a default public channel
        const defaultChannel = new Channel({
            guildId: guild._id,
            name: 'General Broadcast',
            description: `Main public channel for ${name}`,
            adminUserIds: [userId],
            permissions: {
                canPost: [userId],
                canEditMessages: [userId],
                canDeleteMembers: [userId]
            }
        });

        await defaultChannel.save();
        guild.channels.push(defaultChannel._id);
        await guild.save();

        res.status(201).json({ 
            success: true, 
            message: 'Guild created successfully',
            guild 
        });
    } catch (error) {
        console.error('Create guild error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to create guild',
            error: error.message 
        });
    }
};

// Follow/Unfollow a guild
exports.followGuild = async (req, res) => {
    try {
        const { guildId } = req.params;
        const userId = req.user.id;

        const guild = await Guild.findById(guildId);
        if (!guild) {
            return res.status(404).json({ success: false, message: 'Guild not found' });
        }

        const isFollowing = guild.followers.includes(userId);

        if (isFollowing) {
            return res.status(400).json({ 
                success: false, 
                message: 'Already following this guild' 
            });
        }

        guild.addFollower(userId);
        await guild.save();
        
        return res.json({ 
            success: true, 
            message: 'Following guild',
            isFollowing: true,
            followerCount: guild.followerCount
        });
    } catch (error) {
        console.error('Follow guild error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to follow guild',
            error: error.message 
        });
    }
};

// Unfollow guild
exports.unfollowGuild = async (req, res) => {
    try {
        const { guildId } = req.params;
        const userId = req.user.id;

        const guild = await Guild.findById(guildId);
        if (!guild) {
            return res.status(404).json({ success: false, message: 'Guild not found' });
        }

        const isFollowing = guild.followers.includes(userId);

        if (!isFollowing) {
            return res.status(400).json({ 
                success: false, 
                message: 'Not following this guild' 
            });
        }

        guild.removeFollower(userId);
        await guild.save();
        
        return res.json({ 
            success: true, 
            message: 'Unfollowed guild',
            isFollowing: false,
            followerCount: guild.followerCount
        });
    } catch (error) {
        console.error('Unfollow guild error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to unfollow guild',
            error: error.message 
        });
    }
};

// Search guild by custom link
exports.searchGuildByLink = async (req, res) => {
    try {
        const { link } = req.query;

        if (!link) {
            return res.status(400).json({ 
                success: false, 
                message: 'Custom link is required' 
            });
        }

        const guild = await Guild.findOne({ customLink: link })
            .populate('ownerId', 'username avatar ign avatarUrl')
            .populate('members.userId', 'username avatar ign avatarUrl');

        if (!guild) {
            return res.status(404).json({ 
                success: false, 
                message: 'Guild not found' 
            });
        }

        res.json({ success: true, guild });
    } catch (error) {
        console.error('Search guild error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to search guild',
            error: error.message 
        });
    }
};

// Get all guilds
exports.getGuilds = async (req, res) => {
    try {
        const guilds = await Guild.find({ isActive: true })
            .populate('ownerId', 'username avatar ign avatarUrl')
            .select('name customLink logoUrl bannerUrl followerCount totalPosts isVerified');
        
        res.json({ success: true, guilds });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get guild details
exports.getGuildDetails = async (req, res) => {
    try {
        const { guildId } = req.params;

        const guild = await Guild.findById(guildId)
            .populate('ownerId', 'username avatar ign avatarUrl')
            .populate('members.userId', 'username avatar ign avatarUrl')
            .populate('channels')
            .populate('groups');

        if (!guild) {
            return res.status(404).json({ 
                success: false, 
                message: 'Guild not found' 
            });
        }

        res.json({ success: true, guild });
    } catch (error) {
        console.error('Get guild error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to get guild',
            error: error.message 
        });
    }
};

// Join guild (guilds are public, anyone can join)
exports.joinGuild = async (req, res) => {
    try {
        const { guildId } = req.params;
        const userId = req.user.id;

        const guild = await Guild.findById(guildId);
        if (!guild) {
            return res.status(404).json({ success: false, message: 'Guild not found' });
        }

        // Check if already a member
        const isMember = guild.members.some(m => m.userId.toString() === userId);
        if (isMember) {
            return res.status(400).json({ 
                success: false, 
                message: 'Already a member of this guild' 
            });
        }

        // Add as member with default permissions
        guild.members.push({
            userId,
            role: 'Member',
            permissions: {
                canPostInChannels: false,
                canEditChannels: false,
                canDeleteMembers: false,
                canManageGroups: false,
                canStartLive: false,
                canCreateChannels: false,
                canCreateGroups: false,
                canManageAdmins: false
            }
        });

        await guild.save();

        res.json({ 
            success: true, 
            message: 'Joined guild successfully',
            guild 
        });
    } catch (error) {
        console.error('Join guild error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to join guild',
            error: error.message 
        });
    }
};

// Add/promote admin
exports.addAdmin = async (req, res) => {
    try {
        const { guildId } = req.params;
        const { userId: targetUserId, permissions } = req.body;
        const currentUserId = req.user.id;

        const guild = await Guild.findById(guildId);
        if (!guild) {
            return res.status(404).json({ success: false, message: 'Guild not found' });
        }

        // Check if current user can manage admins
        if (!guild.hasPermission(currentUserId, 'canManageAdmins') && 
            guild.ownerId.toString() !== currentUserId) {
            return res.status(403).json({ 
                success: false, 
                message: 'You do not have permission to manage admins' 
            });
        }

        // Find the member
        const member = guild.getMember(targetUserId);
        if (!member) {
            return res.status(404).json({ 
                success: false, 
                message: 'User is not a member of this guild' 
            });
        }

        // Update role and permissions
        member.role = 'Admin';
        if (permissions) {
            member.permissions = { ...member.permissions, ...permissions };
        }

        await guild.save();

        res.json({ 
            success: true, 
            message: 'Admin added successfully',
            guild 
        });
    } catch (error) {
        console.error('Add admin error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to add admin',
            error: error.message 
        });
    }
};

// Update member permissions
exports.updateMemberPermissions = async (req, res) => {
    try {
        const { guildId, userId: targetUserId } = req.params;
        const { permissions } = req.body;
        const currentUserId = req.user.id;

        const guild = await Guild.findById(guildId);
        if (!guild) {
            return res.status(404).json({ success: false, message: 'Guild not found' });
        }

        // Check if current user can manage admins
        if (!guild.hasPermission(currentUserId, 'canManageAdmins') && 
            guild.ownerId.toString() !== currentUserId) {
            return res.status(403).json({ 
                success: false, 
                message: 'You do not have permission to update permissions' 
            });
        }

        const member = guild.getMember(targetUserId);
        if (!member) {
            return res.status(404).json({ 
                success: false, 
                message: 'User is not a member of this guild' 
            });
        }

        // Update permissions
        member.permissions = { ...member.permissions, ...permissions };
        await guild.save();

        res.json({ 
            success: true, 
            message: 'Permissions updated successfully',
            member 
        });
    } catch (error) {
        console.error('Update permissions error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to update permissions',
            error: error.message 
        });
    }
};

// Leave guild
exports.leaveGuild = async (req, res) => {
    try {
        const { guildId } = req.params;
        const userId = req.user.id;

        const guild = await Guild.findById(guildId);
        if (!guild) {
            return res.status(404).json({ success: false, message: 'Guild not found' });
        }

        // Owner cannot leave
        if (guild.ownerId.toString() === userId) {
            return res.status(400).json({ 
                success: false, 
                message: 'Guild owner cannot leave. Transfer ownership or delete the guild.' 
            });
        }

        // Remove member
        guild.members = guild.members.filter(m => m.userId.toString() !== userId);
        await guild.save();

        res.json({ 
            success: true, 
            message: 'Left guild successfully' 
        });
    } catch (error) {
        console.error('Leave guild error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to leave guild',
            error: error.message 
        });
    }
};

// Get user's guilds (where user is a member)
exports.getUserGuilds = async (req, res) => {
    try {
        const userId = req.user.id;

        const guilds = await Guild.find({ 
            'members.userId': userId,
            isActive: true 
        })
        .populate('ownerId', 'username avatar ign avatarUrl')
        .select('name customLink logoUrl bannerUrl followerCount totalPosts isVerified');

        res.json({ success: true, guilds });
    } catch (error) {
        console.error('Get user guilds error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to get guilds',
            error: error.message 
        });
    }
};

// Get followed guilds
exports.getFollowedGuilds = async (req, res) => {
    try {
        const userId = req.user.id;

        const guilds = await Guild.find({ 
            followers: userId,
            isActive: true 
        })
        .populate('ownerId', 'username avatar ign avatarUrl')
        .select('name customLink logoUrl bannerUrl followerCount totalPosts isVerified');

        res.json({ success: true, guilds });
    } catch (error) {
        console.error('Get followed guilds error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to get followed guilds',
            error: error.message 
        });
    }
};

// Create channel (existing functionality maintained)
exports.createChannel = async (req, res) => {
    try {
        const { guildId } = req.params;
        const { name, description } = req.body;
        const userId = req.user.id;

        const guild = await Guild.findById(guildId);
        if (!guild) return res.status(404).json({ success: false, message: 'Guild not found' });

        // Check permission
        if (!guild.hasPermission(userId, 'canCreateChannels') && 
            guild.ownerId.toString() !== userId) {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }

        const channel = new Channel({
            guildId,
            name,
            description,
            adminUserIds: [userId],
            permissions: {
                canPost: [userId],
                canEditMessages: [userId],
                canDeleteMembers: [userId]
            }
        });

        await channel.save();
        guild.channels.push(channel._id);
        await guild.save();

        res.status(201).json({ success: true, channel });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Create group (existing functionality maintained)
exports.createGroup = async (req, res) => {
    try {
        const { guildId } = req.params;
        const { name, description, type } = req.body;
        const userId = req.user.id;

        const guild = await Guild.findById(guildId);
        if (!guild) return res.status(404).json({ success: false, message: 'Guild not found' });

        // Check permission
        if (!guild.hasPermission(userId, 'canCreateGroups') && 
            guild.ownerId.toString() !== userId) {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }

        // Generate invite code for private groups
        const inviteCode = type === 'Private' 
            ? Math.random().toString(36).substring(2, 10).toUpperCase() 
            : undefined;

        const group = new Group({
            guildId,
            name,
            description,
            type: type || 'Private',
            inviteCode,
            members: [{ 
                userId, 
                role: 'Owner',
                permissions: {
                    canPost: true,
                    canCall: true,
                    canInvite: true
                }
            }]
        });

        await group.save();
        guild.groups.push(group._id);
        await guild.save();

        res.status(201).json({ success: true, group });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Join group by invite link
exports.joinGroupByLink = async (req, res) => {
    try {
        const { inviteCode } = req.params;
        const userId = req.user.id;

        const group = await Group.findOne({ inviteCode, isActive: true });
        if (!group) return res.status(404).json({ success: false, message: 'Invalid or expired invite link' });

        const isMember = group.members.some(m => m.userId.toString() === userId);
        if (isMember) return res.json({ success: true, message: 'Already a member', group });

        group.members.push({ 
            userId, 
            role: 'Member',
            permissions: {
                canPost: true,
                canCall: true,
                canInvite: false
            }
        });
        await group.save();

        res.json({ success: true, group });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
