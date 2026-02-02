const mongoose = require('mongoose');

const ChallengeSchema = new mongoose.Schema({
    challengerName: { type: String, required: true },
    challengerRole: { type: String },
    type: { type: String, default: '1v1' },
    wager: { type: Number, default: 0 },
    map: { type: String, default: 'Bermuda' },
    message: { type: String },
    status: { type: String, enum: ['Open', 'Accepted', 'Completed', 'Rejected'], default: 'Open' },
    time: { type: String },
    proposedTime: { type: Date }, // Time selected by user
    targetId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Optional user or team ID
    acceptorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    acceptorName: String,
    acceptorRole: String
}, { timestamps: true });

module.exports = mongoose.models.Challenge || mongoose.model('Challenge', ChallengeSchema);
