const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
        type: String,
        enum: ['super_admin', 'tournament_admin', 'challenge_admin', 'banner_admin', 'content_admin', 'user_admin', 'live_admin'],
        default: 'content_admin'
    },
    permissions: {
        tournaments: [String],
        canManageChallenges: { type: Boolean, default: false },
        canManageUsers: { type: Boolean, default: false },
        canManageTransactions: { type: Boolean, default: false },
        canManageBanners: { type: Boolean, default: false },
        canManageContent: { type: Boolean, default: false },
        canManageLive: { type: Boolean, default: false }
    },
    isActive: { type: Boolean, default: true },
    createdBy: String,
    lastLogin: Date
}, { timestamps: true });

module.exports = mongoose.models.Admin || mongoose.model('Admin', AdminSchema);
