const mongoose = require('mongoose');
const Message = require('../models/Message');

const chatController = {
    getChatHistory: async (req, res) => {
        try {
            const { teamId, targetUserId } = req.query;
            const { limit = 50, before } = req.query;

            let query = { isDeleted: false };

            if (teamId) {
                query.teamId = teamId;
                query.type = 'TEAM';
            } else if (targetUserId) {
                // Private chat: sender is req.user.id and receiver is targetUserId OR vice versa
                const userId = req.user.id;
                query.$or = [
                    { senderId: userId, receiverId: targetUserId },
                    { senderId: targetUserId, receiverId: userId }
                ];
                query.type = 'PRIVATE';
            }

            if (before) {
                query.timestamp = { $lt: new Date(before) };
            }

            const messages = await Message.find(query)
                .sort({ timestamp: -1 })
                .limit(parseInt(limit))
                .populate('repliedTo', 'senderName text')
                .lean();

            const timeline = messages.reverse().map(msg => ({
                ...msg,
                id: msg._id.toString()
            }));

            res.json({ success: true, messages: timeline });
        } catch (error) {
            console.error('[DEBUG] getChatHistory Error:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    saveMessage: async (data) => {
        try {
            const newMessage = new Message({
                type: data.type || (data.teamId ? 'TEAM' : 'PRIVATE'),
                teamId: data.teamId || null,
                receiverId: data.receiverId || data.targetUserId || null,
                senderId: data.senderId,
                senderName: data.senderName,
                text: data.text,
                tempId: data.tempId,
                repliedTo: data.repliedTo || null,
                isForwarded: data.isForwarded || false,
                forwardedFrom: data.forwardedFrom || null,
                status: 'sent'
            });
            await newMessage.save();

            // Populate if it's a reply for the returned object
            if (newMessage.repliedTo) {
                await newMessage.populate('repliedTo', 'senderName text');
            }

            return {
                ...newMessage.toObject(),
                id: newMessage._id.toString()
            };
        } catch (error) {
            console.error('Error saving message:', error);
            return null;
        }
    },

    toggleReaction: async (messageId, userId, senderName, emoji) => {
        try {
            const message = await Message.findById(messageId);
            if (!message) return null;

            const existingIndex = message.reactions.findIndex(r => r.userId.toString() === userId.toString() && r.emoji === emoji);

            if (existingIndex > -1) {
                message.reactions.splice(existingIndex, 1);
            } else {
                message.reactions.push({ userId, senderName, emoji });
            }

            await message.save();
            return {
                ...message.toObject(),
                id: message._id.toString()
            };
        } catch (error) {
            console.error('Error toggling reaction:', error);
            return null;
        }
    },

    updateMessage: async (messageId, text) => {
        try {
            const updated = await Message.findByIdAndUpdate(
                messageId,
                { text, isEdited: true },
                { new: true }
            );
            if (!updated) return null;
            return {
                ...updated.toObject(),
                id: updated._id.toString()
            };
        } catch (error) {
            console.error('Error updating message:', error);
            return null;
        }
    },

    deleteMessage: async (messageId) => {
        try {
            await Message.findByIdAndUpdate(messageId, { isDeleted: true });
            return true;
        } catch (error) {
            console.error('Error deleting message:', error);
            return false;
        }
    },

    getRecentConversations: async (req, res) => {
        try {
            const userId = req.user.id;
            console.log(`[DEBUG] Fetching conversations for user: ${userId}`);
            console.log(`[DEBUG] User ID type: ${typeof userId}`);

            // Find unique conversations (Private)
            const privateConversations = await Message.aggregate([
                {
                    $match: {
                        type: 'PRIVATE',
                        $or: [{ senderId: new mongoose.Types.ObjectId(userId) }, { receiverId: new mongoose.Types.ObjectId(userId) }]
                    }
                },
                { $sort: { timestamp: -1 } },
                {
                    $group: {
                        _id: {
                            $cond: [
                                { $eq: ['$senderId', new mongoose.Types.ObjectId(userId)] },
                                '$receiverId',
                                '$senderId'
                            ]
                        },
                        lastMsg: { $first: '$text' },
                        lastTime: { $first: '$timestamp' },
                        unreadCount: {
                            $sum: { $cond: [{ $and: [{ $eq: ['$receiverId', new mongoose.Types.ObjectId(userId)] }, { $ne: ['$status', 'read'] }] }, 1, 0] }
                        }
                    }
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'userDetails'
                    }
                },
                {
                    $addFields: {
                        hasUserDetails: { $gt: [{ $size: '$userDetails' }, 0] }
                    }
                }
            ]);

            console.log(`[DEBUG] Aggregation result size: ${privateConversations.length}`);
            if (privateConversations.length > 0) {
                console.log(`[DEBUG] First convo example:`, JSON.stringify({
                    id: privateConversations[0]._id,
                    hasDetails: privateConversations[0].hasUserDetails
                }));
            }

            const processedConversations = privateConversations
                .filter(c => c.hasUserDetails)
                .map(c => ({
                    id: c._id.toString(),
                    name: c.userDetails[0].ign,
                    avatar: c.userDetails[0].avatarUrl,
                    lastMsg: c.lastMsg,
                    lastTime: c.lastTime,
                    unread: c.unreadCount,
                    type: 'PRIVATE'
                }));

            res.json({ success: true, conversations: processedConversations });
        } catch (error) {
            console.error('getRecentConversations Error:', error);
            res.status(500).json({ success: false, conversations: [] });
        }
    },

    markMessagesAsRead: async (req, res) => {
        try {
            const userId = req.user.id;
            const { targetUserId } = req.body;

            if (!targetUserId) {
                return res.status(400).json({ success: false, message: 'targetUserId required' });
            }

            // Mark all messages FROM targetUserId TO current user as 'read'
            const result = await Message.updateMany(
                {
                    type: 'PRIVATE',
                    senderId: new mongoose.Types.ObjectId(targetUserId),
                    receiverId: new mongoose.Types.ObjectId(userId),
                    status: { $ne: 'read' }
                },
                {
                    $set: { status: 'read' }
                }
            );

            console.log(`[Chat] Marked ${result.modifiedCount} messages as read from ${targetUserId} to ${userId}`);
            res.json({ success: true, markedCount: result.modifiedCount });
        } catch (error) {
            console.error('[Chat] markMessagesAsRead error:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    saveCallLog: async (data) => {
        try {
            // data: { senderId, receiverId, type: 'audio'|'video', status: 'missed'|'completed', duration: number }
            const text = data.status === 'missed' 
                ? `Missed ${data.type} call` 
                : `${data.type.charAt(0).toUpperCase() + data.type.slice(1)} call ended • ${Math.floor(data.duration / 60)}m ${data.duration % 60}s`;

            const newMessage = new Message({
                type: 'PRIVATE',
                receiverId: data.receiverId,
                senderId: data.senderId,
                senderName: 'System', // Or could be the caller's name
                text: text,
                status: 'sent',
                timestamp: new Date()
            });
            await newMessage.save();
            return {
                ...newMessage.toObject(),
                id: newMessage._id.toString()
            };
        } catch (error) {
            console.error('Error saving call log:', error);
            return null;
        }
    }
};

module.exports = chatController;

