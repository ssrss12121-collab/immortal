const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    ign: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    playerId: { type: String, unique: true, sparse: true },
    password: { type: String, required: true },
    name: { type: String },
    age: { type: Number },
    country: { type: String, default: 'Bangladesh' },
    district: { type: String },
    gameRole: { type: String, default: 'Rusher' },
    experience: { type: String, default: 'Beginner' },
    walletBalance: { type: Number, default: 0 },
    membership: {
        planId: { type: mongoose.Schema.Types.ObjectId, ref: 'MembershipPlan' },
        expiresAt: { type: Date },
        type: { type: String, enum: ['individual', 'team'] },
        challengesUsed: { type: Number, default: 0 },
        lastChallengeReset: { type: Date, default: Date.now }
    },
    stats: {
        matches: { type: Number, default: 0 },
        kills: { type: Number, default: 0 },
        wins: { type: Number, default: 0 },
        kdRatio: { type: Number, default: 0 },
        rankPoints: { type: Number, default: 0 },
        badge: { type: String, default: 'Bronze' }
    },
    avatarUrl: { type: String, default: '' },
    lastTeamDeletedAt: { type: Date },
    teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
    matchHistory: [{
        tournamentId: String,
        tournamentTitle: String,
        position: Number,
        kills: Number,
        prize: Number,
        timestamp: { type: Date, default: Date.now }
    }],
    settings: {
        emailNotifs: { type: Boolean, default: true }
    },
    isActive: { type: Boolean, default: true },
    token: String
}, { timestamps: true });

module.exports = mongoose.models.User || mongoose.model('User', UserSchema);
