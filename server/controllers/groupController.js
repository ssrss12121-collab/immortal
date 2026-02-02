const Group = require('../models/Group');
const Guild = require('../models/Guild');

// Get group details
exports.getGroup = async (req, res) => {
    try {
        const { groupId } = req.params;

        const group = await Group.findById(groupId)
            .populate('guildId', 'name customLink logoUrl')
            .populate('members.userId', 'username ign avatar avatarUrl');

        if (!group) {
            return res.status(404).json({ success: false, message: 'Group not found' });
        }

        res.json({ success: true, group });
    } catch (error) {
        console.error('Get group error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to get group',
            error: error.message 
        });
    }
};

// Edit group
exports.editGroup = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { name, description, allowMessaging } = req.body;
        const userId = req.user.id;

        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ success: false, message: 'Group not found' });
        }

        // Check if user is group owner or admin
        const member = group.getMember(userId);
        if (!member || (member.role !== 'Owner' && member.role !== 'Admin')) {
            return res.status(403).json({ 
                success: false, 
                message: 'Only group owner or admin can edit the group' 
            });
        }

        if (name) group.name = name;
        if (description !== undefined) group.description = description;
        if (allowMessaging !== undefined) group.allowMessaging = allowMessaging;

        await group.save();

        res.json({ 
            success: true, 
            message: 'Group updated successfully',
            group 
        });
    } catch (error) {
        console.error('Edit group error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to edit group',
            error: error.message 
        });
    }
};

// Join group (public only, private requires invite)
exports.joinGroup = async (req, res) => {
    try {
        const { groupId } = req.params;
        const userId = req.user.id;

        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ success: false, message: 'Group not found' });
        }

        // Check if group is public
        if (group.type !== 'Public') {
            return res.status(400).json({ 
                success: false, 
                message: 'This is a private group. You need an invite link to join.' 
            });
        }

        // Check if already a member
        if (group.isMember(userId)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Already a member of this group' 
            });
        }

        // Check if user is guild member
        const guild = await Guild.findById(group.guildId);
        if (!guild || !guild.getMember(userId)) {
            return res.status(403).json({ 
                success: false, 
                message: 'You must be a guild member to join this group' 
            });
        }

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

        res.json({ 
            success: true, 
            message: 'Joined group successfully',
            group 
        });
    } catch (error) {
        console.error('Join group error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to join group',
            error: error.message 
        });
    }
};

// Leave group
exports.leaveGroup = async (req, res) => {
    try {
        const { groupId } = req.params;
        const userId = req.user.id;

        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ success: false, message: 'Group not found' });
        }

        const member = group.getMember(userId);
        if (!member) {
            return res.status(400).json({ 
                success: false, 
                message: 'You are not a member of this group' 
            });
        }

        // Owner cannot leave
        if (member.role === 'Owner') {
            return res.status(400).json({ 
                success: false, 
                message: 'Group owner cannot leave. Transfer ownership or delete the group.' 
            });
        }

        group.members = group.members.filter(m => m.userId.toString() !== userId);
        await group.save();

        res.json({ 
            success: true, 
            message: 'Left group successfully' 
        });
    } catch (error) {
        console.error('Leave group error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to leave group',
            error: error.message 
        });
    }
};

// Invite user to group (generates/returns invite code)
exports.inviteToGroup = async (req, res) => {
    try {
        const { groupId } = req.params;
        const userId = req.user.id;

        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ success: false, message: 'Group not found' });
        }

        const member = group.getMember(userId);
        if (!member) {
            return res.status(403).json({ 
                success: false, 
                message: 'You are not a member of this group' 
            });
        }

        // Check permission
        if (!member.permissions.canInvite && member.role !== 'Owner' && member.role !== 'Admin') {
            return res.status(403).json({ 
                success: false, 
                message: 'You do not have permission to invite users' 
            });
        }

        // Generate invite code if not exists
        if (!group.inviteCode) {
            group.inviteCode = Math.random().toString(36).substring(2, 10).toUpperCase();
            await group.save();
        }

        res.json({ 
            success: true, 
            inviteCode: group.inviteCode,
            inviteLink: `/groups/join/${group.inviteCode}`
        });
    } catch (error) {
        console.error('Invite to group error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to generate invite',
            error: error.message 
        });
    }
};

// Update member permissions
exports.updateGroupMemberPermissions = async (req, res) => {
    try {
        const { groupId, userId: targetUserId } = req.params;
        const { permissions } = req.body;
        const currentUserId = req.user.id;

        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ success: false, message: 'Group not found' });
        }

        const currentMember = group.getMember(currentUserId);
        if (!currentMember || (currentMember.role !== 'Owner' && currentMember.role !== 'Admin')) {
            return res.status(403).json({ 
                success: false, 
                message: 'Only owner or admin can update permissions' 
            });
        }

        const targetMember = group.getMember(targetUserId);
        if (!targetMember) {
            return res.status(404).json({ 
                success: false, 
                message: 'User is not a member of this group' 
            });
        }

        // Update permissions
        targetMember.permissions = { ...targetMember.permissions, ...permissions };
        await group.save();

        res.json({ 
            success: true, 
            message: 'Permissions updated successfully',
            member: targetMember 
        });
    } catch (error) {
        console.error('Update group permissions error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to update permissions',
            error: error.message 
        });
    }
};

// Kick member from group
exports.kickMember = async (req, res) => {
    try {
        const { groupId, userId: targetUserId } = req.params;
        const currentUserId = req.user.id;

        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ success: false, message: 'Group not found' });
        }

        const currentMember = group.getMember(currentUserId);
        if (!currentMember || (currentMember.role !== 'Owner' && currentMember.role !== 'Admin')) {
            return res.status(403).json({ 
                success: false, 
                message: 'Only owner or admin can kick members' 
            });
        }

        const targetMember = group.getMember(targetUserId);
        if (!targetMember) {
            return res.status(404).json({ 
                success: false, 
                message: 'User is not a member of this group' 
            });
        }

        // Cannot kick owner
        if (targetMember.role === 'Owner') {
            return res.status(400).json({ 
                success: false, 
                message: 'Cannot kick group owner' 
            });
        }

        group.members = group.members.filter(m => m.userId.toString() !== targetUserId);
        await group.save();

        res.json({ 
            success: true, 
            message: 'Member kicked successfully' 
        });
    } catch (error) {
        console.error('Kick member error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to kick member',
            error: error.message 
        });
    }
};

// Delete group
exports.deleteGroup = async (req, res) => {
    try {
        const { groupId } = req.params;
        const userId = req.user.id;

        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ success: false, message: 'Group not found' });
        }

        const member = group.getMember(userId);
        if (!member || member.role !== 'Owner') {
            return res.status(403).json({ 
                success: false, 
                message: 'Only group owner can delete the group' 
            });
        }

        group.isActive = false;
        await group.save();

        // Remove from guild's groups array
        await Guild.findByIdAndUpdate(group.guildId, {
            $pull: { groups: groupId }
        });

        res.json({ 
            success: true, 
            message: 'Group deleted successfully' 
        });
    } catch (error) {
        console.error('Delete group error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to delete group',
            error: error.message 
        });
    }
};

module.exports = exports;
