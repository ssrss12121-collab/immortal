const mongoose = require('mongoose');

const GuildSchema = new mongoose.Schema({
    name: { type: String, required: true },
    customLink: { 
        type: String, 
        required: true, 
        unique: true,
        validate: {
            validator: function(v) {
                return /^TR\.[a-zA-Z0-9_-]+$/.test(v);
            },
            message: props => `${props.value} is not a valid guild link! Must start with "TR." followed by alphanumeric characters`
        }
    },
    description: { type: String, default: '' },
    logoUrl: { type: String, required: true },
    bannerUrl: { type: String },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    
    // Members with roles and granular permissions
    members: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        role: { type: String, enum: ['Owner', 'Admin', 'Member'], default: 'Member' },
        permissions: {
            canPostInChannels: { type: Boolean, default: false },
            canEditChannels: { type: Boolean, default: false },
            canDeleteMembers: { type: Boolean, default: false },
            canManageGroups: { type: Boolean, default: false },
            canStartLive: { type: Boolean, default: false },
            canCreateChannels: { type: Boolean, default: false },
            canCreateGroups: { type: Boolean, default: false },
            canManageAdmins: { type: Boolean, default: false }
        },
        joinedAt: { type: Date, default: Date.now }
    }],
    
    // Followers (non-members who follow the guild)
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    followerCount: { type: Number, default: 0 },
    
    // Linked content
    channels: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Channel' }],
    groups: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Group' }],
    
    // Verification & subscription
    isVerified: { type: Boolean, default: false },
    verificationSubscriptionId: { type: mongoose.Schema.Types.ObjectId, ref: 'MembershipPlan' },
    verificationExpiresAt: { type: Date },
    
    // Stats
    isActive: { type: Boolean, default: true },
    totalPosts: { type: Number, default: 0 },
    totalLives: { type: Number, default: 0 }
}, {
    timestamps: true
});

// Indexes for performance
GuildSchema.index({ customLink: 1 });
GuildSchema.index({ ownerId: 1 });
GuildSchema.index({ 'members.userId': 1 });
GuildSchema.index({ isActive: 1 });

// Methods
GuildSchema.methods.addFollower = function(userId) {
    if (!this.followers.includes(userId)) {
        this.followers.push(userId);
        this.followerCount++;
    }
};

GuildSchema.methods.removeFollower = function(userId) {
    const index = this.followers.indexOf(userId);
    if (index > -1) {
        this.followers.splice(index, 1);
        this.followerCount--;
    }
};

GuildSchema.methods.getMember = function(userId) {
    return this.members.find(m => m.userId.toString() === userId.toString());
};

GuildSchema.methods.hasPermission = function(userId, permission) {
    const member = this.getMember(userId);
    if (!member) return false;
    if (member.role === 'Owner') return true; // Owner has all permissions
    return member.permissions[permission] === true;
};

module.exports = mongoose.model('Guild', GuildSchema);
