const mongoose = require('mongoose');

const TeamSchema = new mongoose.Schema({
    name: { type: String, required: true, index: true }, // Indexed for search
    shortName: { type: String, required: true },
    captainId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    leaderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    members: [{
        id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        playerId: String, // Public identifier for display
        name: String,
        ign: String,
        email: String,
        role: String,
        experience: String,
        age: Number,
        country: String,
        district: String,
        walletBalance: Number,
        stats: Object,
        avatarUrl: String,
        teamId: String
    }],
    rankPoints: { type: Number, default: 0, index: true }, // Indexed for team rankings
    logoUrl: { type: String },
    bannerUrl: { type: String }, // New field
    country: { type: String, default: 'Bangladesh' },
    district: { type: String },
    canDeleteAt: { type: Date, default: null }, // New field
    stats: {
        matches: { type: Number, default: 0 },
        wins: { type: Number, default: 0 },
        totalKills: { type: Number, default: 0 },
        mvpId: String
    },
    matchHistory: [{
        tournamentId: String,
        tournamentTitle: String,
        position: Number,
        totalKills: Number,
        prize: Number,
        timestamp: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

// Compound indexes for team queries
TeamSchema.index({ rankPoints: -1, createdAt: -1 }); // For team leaderboards
TeamSchema.index({ 'members.id': 1 }); // For finding teams by member

module.exports = mongoose.models.Team || mongoose.model('Team', TeamSchema);
