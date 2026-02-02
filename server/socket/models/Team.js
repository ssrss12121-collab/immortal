const mongoose = require('mongoose');

const TeamSchema = new mongoose.Schema({
    name: { type: String, required: true },
    shortName: { type: String, required: true },
    captainId: { type: String, required: true }, // User ID of captain
    leaderId: { type: String, required: true },
    members: [{
        id: String,
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
    rankPoints: { type: Number, default: 0 },
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

module.exports = mongoose.models.Team || mongoose.model('Team', TeamSchema);
