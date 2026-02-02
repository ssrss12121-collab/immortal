const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    teamId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team',
        required: true,
        index: true
    },
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    senderName: {
        type: String,
        required: true
    },
    text: {
        type: String,
        required: true
    },
    tempId: { // For optimistic UI matching
        type: String,
        index: true
    },
    status: {
        type: String,
        enum: ['sending', 'sent', 'delivered', 'read'],
        default: 'sent'
    },
    isEdited: {
        type: Boolean,
        default: false
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    repliedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message',
        default: null
    },
    reactions: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        senderName: String,
        emoji: String
    }],
    isForwarded: {
        type: Boolean,
        default: false
    },
    forwardedFrom: {
        type: String, // Original sender name
        default: null
    },
    timestamp: {
        type: Date,
        default: Date.now,
        index: true
    }
});

// Compound index for optimized chat history fetching
MessageSchema.index({ teamId: 1, timestamp: -1 });

module.exports = mongoose.models.Message || mongoose.model('Message', MessageSchema);
