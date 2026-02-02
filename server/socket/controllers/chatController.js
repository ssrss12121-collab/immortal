const Message = require('../models/Message');

const chatController = {
    getChatHistory: async (req, res) => {
        try {
            const { teamId } = req.params;
            const { limit = 50, before } = req.query;

            console.log(`[DEBUG] Fetching chat history for team: ${teamId}`);

            let query = { teamId, isDeleted: false };
            if (before) {
                query.timestamp = { $lt: new Date(before) };
            }

            const messages = await Message.find(query)
                .sort({ timestamp: -1 })
                .limit(parseInt(limit))
                .populate('repliedTo', 'senderName text') // Populate reply data
                .lean();

            console.log(`[DEBUG] Found ${messages.length} messages for team ${teamId}`);

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
                teamId: data.teamId,
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
    }
};

module.exports = chatController;
