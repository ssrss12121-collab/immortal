const mongoose = require('mongoose');

const TournamentSchema = new mongoose.Schema({
    title: { type: String, required: true },
    category: { type: String, enum: ['Solo', 'Duo', 'Squad'], required: true },
    isPremium: { type: Boolean, default: false },
    sponsors: [String],
    prizePool: { type: Number, default: 0 },
    perKillCommission: { type: Number, default: 0 },
    prizeList: [Number],
    startTime: { type: String },
    map: { type: String },
    slots: { type: Number, default: 48 },
    filledSlots: { type: Number, default: 0 },
    status: { type: String, enum: ['Open', 'Live', 'Completed', 'Closed'], default: 'Open' },
    image: { type: String },
    participants: [{
        id: String, // User ID
        name: String,
        avatar: String,
        isTeam: Boolean,
        teamName: String,
        members: [{ id: String, name: String }]
    }],
    matchResult: {
        scores: [{
            participantId: String,
            kills: Number,
            position: Number,
            totalPoints: Number,
            memberStats: [{
                id: String,
                name: String,
                kills: Number
            }]
        }],
        mvpId: String,
        published: { type: Boolean, default: false },
        publishBanner: { type: Boolean, default: false }
    },
    roomId: { type: String },
    roomPassword: { type: String },
    credentialsPublished: { type: Boolean, default: false },
    rules: { type: String },
    videoUrl: { type: String },
    roadmap: { type: String },
    isUnlimited: { type: Boolean, default: false },
    featured: { type: Boolean, default: false },
    showOnDeployments: { type: Boolean, default: false },
    groups: [{
        id: String,
        name: String,
        teams: [String],
        roomId: String,
        roomPassword: String,
        credentialsPublished: Boolean,
        schedule: String
    }]
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

TournamentSchema.index({ status: 1 });
TournamentSchema.index({ category: 1 });
TournamentSchema.index({ createdAt: -1 });

module.exports = mongoose.models.Tournament || mongoose.model('Tournament', TournamentSchema);
