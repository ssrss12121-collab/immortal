const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    ign: { type: String, required: true, index: true }, // Indexed for search
    email: { type: String, required: true, unique: true, index: true, lowercase: true },
    playerId: { type: String, unique: true, sparse: true, index: true },
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
        rankPoints: { type: Number, default: 0, index: true }, // Indexed for ranking queries
        badge: { type: String, default: 'Bronze' }
    },
    avatarUrl: { type: String, default: '' },
    lastTeamDeletedAt: { type: Date },
    teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', index: true }, // Indexed for team lookups
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

// Compound indexes for common queries
UserSchema.index({ email: 1, isActive: 1 });
UserSchema.index({ 'stats.rankPoints': -1, createdAt: -1 }); // For leaderboards
UserSchema.index({ teamId: 1, isActive: 1 }); // For team member queries

module.exports = mongoose.models.User || mongoose.model('User', UserSchema);
