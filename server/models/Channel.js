const mongoose = require('mongoose');

const ChannelSchema = new mongoose.Schema({
    guildId: { type: mongoose.Schema.Types.ObjectId, ref: 'Guild', required: true },
    name: { type: String, required: true },
    description: { type: String, default: '' },
    type: { type: String, default: 'Public' }, // Channels are always public
    
    // Admin permissions - who can post/manage
    adminUserIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    permissions: {
        canPost: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Which users can post
        canEditMessages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        canDeleteMembers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
    },
    
    // Live streaming
    activeLiveSessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'LiveSession' },
    isLive: { type: Boolean, default: false },
    
    // Verification
    isVerified: { type: Boolean, default: false },
    
    // Stats
    isActive: { type: Boolean, default: true },
    totalPosts: { type: Number, default: 0 },
    totalLives: { type: Number, default: 0 }
}, {
    timestamps: true
});

// Indexes
ChannelSchema.index({ guildId: 1 });
ChannelSchema.index({ isActive: 1 });

// Methods
ChannelSchema.methods.canUserPost = function(userId) {
    return this.permissions.canPost.some(id => id.toString() === userId.toString());
};

ChannelSchema.methods.addAdmin = function(userId) {
    if (!this.adminUserIds.includes(userId)) {
        this.adminUserIds.push(userId);
        if (!this.permissions.canPost.includes(userId)) {
            this.permissions.canPost.push(userId);
        }
    }
};

module.exports = mongoose.model('Channel', ChannelSchema);
