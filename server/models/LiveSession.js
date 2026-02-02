const mongoose = require('mongoose');

const LiveSessionSchema = new mongoose.Schema({
    hostId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    
    // Type of live stream
    liveType: { 
        type: String, 
        enum: ['Video', 'VoiceSeated', 'VoiceFree'], 
        required: true 
    },
    
    // Source of the live
    sourceType: { 
        type: String, 
        enum: ['Guild', 'Channel', 'Group', 'Public'], 
        required: true 
    },
    sourceId: { type: mongoose.Schema.Types.ObjectId }, // Guild, Channel, or Group ID
    
    // Content
    title: { type: String, required: true },
    thumbnailUrl: { type: String }, // For video lives only
    description: { type: String },
    
    // Voice Seated specific (10-12 people seats)
    seats: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        position: { type: Number, min: 1, max: 12 }, // Seat position
        isSpeaking: { type: Boolean, default: false },
        micActive: { type: Boolean, default: true },
        joinedAt: { type: Date, default: Date.now }
    }],
    maxSeats: { type: Number, default: 12, min: 6, max: 12 },
    
    // Viewers tracking
    viewers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    viewersCount: { type: Number, default: 0 },
    peakViewers: { type: Number, default: 0 },
    
    // Reactions (like, love, fire, clap)
    reactions: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        type: { type: String, enum: ['like', 'love', 'fire', 'clap', 'wow'] },
        timestamp: { type: Date, default: Date.now }
    }],
    reactionCounts: {
        like: { type: Number, default: 0 },
        love: { type: Number, default: 0 },
        fire: { type: Number, default: 0 },
        clap: { type: Number, default: 0 },
        wow: { type: Number, default: 0 }
    },
    
    // Status
    status: { type: String, enum: ['Live', 'Ended'], default: 'Live' },
    startedAt: { type: Date, default: Date.now },
    endedAt: { type: Date },
    duration: { type: Number }, // in seconds
    
    // Settings
    isPublic: { type: Boolean, default: true }, // Show in public live feed
    allowComments: { type: Boolean, default: true },
    allowReactions: { type: Boolean, default: true }
}, {
    timestamps: true
});

// Indexes
LiveSessionSchema.index({ hostId: 1 });
LiveSessionSchema.index({ sourceType: 1, sourceId: 1 });
LiveSessionSchema.index({ status: 1 });
LiveSessionSchema.index({ isPublic: 1, status: 1 });

// Methods
LiveSessionSchema.methods.addViewer = function(userId) {
    if (!this.viewers.includes(userId)) {
        this.viewers.push(userId);
        this.viewersCount++;
        if (this.viewersCount > this.peakViewers) {
            this.peakViewers = this.viewersCount;
        }
    }
};

LiveSessionSchema.methods.removeViewer = function(userId) {
    const index = this.viewers.indexOf(userId);
    if (index > -1) {
        this.viewers.splice(index, 1);
        this.viewersCount--;
    }
};

LiveSessionSchema.methods.addReaction = function(userId, type) {
    this.reactions.push({ userId, type });
    this.reactionCounts[type]++;
};

LiveSessionSchema.methods.joinSeat = function(userId, position) {
    if (this.liveType !== 'VoiceSeated') return false;
    if (this.seats.length >= this.maxSeats) return false;
    
    const existingSeat = this.seats.find(s => s.userId.toString() === userId.toString());
    if (existingSeat) return false;
    
    this.seats.push({ userId, position, isSpeaking: false, micActive: true });
    return true;
};

LiveSessionSchema.methods.leaveSeat = function(userId) {
    const index = this.seats.findIndex(s => s.userId.toString() === userId.toString());
    if (index > -1) {
        this.seats.splice(index, 1);
        return true;
    }
    return false;
};

LiveSessionSchema.methods.endSession = function() {
    this.status = 'Ended';
    this.endedAt = new Date();
    this.duration = Math.floor((this.endedAt - this.startedAt) / 1000);
};

module.exports = mongoose.model('LiveSession', LiveSessionSchema);
