const mongoose = require('mongoose');

const GuildPostSchema = new mongoose.Schema({
    guildId: { type: mongoose.Schema.Types.ObjectId, ref: 'Guild', required: true },
    channelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Channel' }, // Optional, if posted in specific channel
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    
    // Content
    content: { type: String, required: true },
    mediaUrls: [{ type: String }], // Images, videos, files
    
    // Reactions
    reactions: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        type: { type: String, enum: ['like', 'love', 'fire', 'clap', 'wow', 'sad', 'angry'] },
        timestamp: { type: Date, default: Date.now }
    }],
    reactionCounts: {
        like: { type: Number, default: 0 },
        love: { type: Number, default: 0 },
        fire: { type: Number, default: 0 },
        clap: { type: Number, default: 0 },
        wow: { type: Number, default: 0 },
        sad: { type: Number, default: 0 },
        angry: { type: Number, default: 0 }
    },
    totalReactions: { type: Number, default: 0 },
    
    // Comments (optional - can be handled separately)
    commentCount: { type: Number, default: 0 },
    
    // Status
    isActive: { type: Boolean, default: true },
    isPinned: { type: Boolean, default: false },
    isEdited: { type: Boolean, default: false },
    editedAt: { type: Date }
}, {
    timestamps: true
});

// Indexes
GuildPostSchema.index({ guildId: 1, createdAt: -1 });
GuildPostSchema.index({ channelId: 1, createdAt: -1 });
GuildPostSchema.index({ authorId: 1 });
GuildPostSchema.index({ isActive: 1 });

// Methods
GuildPostSchema.methods.addReaction = function(userId, type) {
    // Remove existing reaction from this user if any
    this.reactions = this.reactions.filter(r => r.userId.toString() !== userId.toString());
    
    // Add new reaction
    this.reactions.push({ userId, type });
    
    // Recalculate counts
    this.reactionCounts = {
        like: 0, love: 0, fire: 0, clap: 0, wow: 0, sad: 0, angry: 0
    };
    this.reactions.forEach(r => {
        this.reactionCounts[r.type]++;
    });
    this.totalReactions = this.reactions.length;
};

GuildPostSchema.methods.removeReaction = function(userId) {
    const index = this.reactions.findIndex(r => r.userId.toString() === userId.toString());
    if (index > -1) {
        const type = this.reactions[index].type;
        this.reactions.splice(index, 1);
        this.reactionCounts[type]--;
        this.totalReactions--;
        return true;
    }
    return false;
};

module.exports = mongoose.model('GuildPost', GuildPostSchema);
