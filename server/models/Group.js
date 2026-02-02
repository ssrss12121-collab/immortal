const mongoose = require('mongoose');

const GroupSchema = new mongoose.Schema({
    guildId: { type: mongoose.Schema.Types.ObjectId, ref: 'Guild', required: true },
    name: { type: String, required: true },
    description: { type: String, default: '' },
    type: { type: String, enum: ['Public', 'Private'], default: 'Private' },
    inviteCode: { type: String, unique: true, sparse: true }, // For private group invites
    
    // Members (for private groups, public groups auto-join from guild)
    members: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        role: { type: String, enum: ['Owner', 'Admin', 'Member'], default: 'Member' },
        permissions: {
            canPost: { type: Boolean, default: true },
            canCall: { type: Boolean, default: true },
            canInvite: { type: Boolean, default: false }
        },
        joinedAt: { type: Date, default: Date.now }
    }],
    
    // Permission settings
    allowMessaging: { type: Boolean, default: true }, // If false, only admins can message
    
    // Active sessions
    activeCallId: { type: mongoose.Schema.Types.ObjectId, ref: 'Call' },
    activeLiveSessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'LiveSession' },
    isLive: { type: Boolean, default: false },
    isInCall: { type: Boolean, default: false },
    
    // Verification
    isVerified: { type: Boolean, default: false },
    
    // Stats
    isActive: { type: Boolean, default: true },
    totalMessages: { type: Number, default: 0 },
    totalCalls: { type: Number, default: 0 }
}, {
    timestamps: true
});

// Indexes
GroupSchema.index({ guildId: 1 });
GroupSchema.index({ type: 1 });
GroupSchema.index({ inviteCode: 1 });
GroupSchema.index({ 'members.userId': 1 });

// Methods
GroupSchema.methods.isMember = function(userId) {
    return this.members.some(m => m.userId.toString() === userId.toString());
};

GroupSchema.methods.getMember = function(userId) {
    return this.members.find(m => m.userId.toString() === userId.toString());
};

GroupSchema.methods.canUserPost = function(userId) {
    if (!this.allowMessaging) {
        const member = this.getMember(userId);
        return member && (member.role === 'Owner' || member.role === 'Admin');
    }
    const member = this.getMember(userId);
    return member && member.permissions.canPost;
};

module.exports = mongoose.model('Group', GroupSchema);
