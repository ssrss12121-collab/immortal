const mongoose = require('mongoose');
const Challenge = require('../models/Challenge');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

exports.getChallenges = async (req, res) => {
    try {
        const challenges = await Challenge.find({ status: 'Open' }).sort({ createdAt: -1 });
        // Map _id to id for frontend compatibility
        const formattedChallenges = challenges.map(c => ({
            ...c.toObject(),
            id: c._id.toString()
        }));
        res.json({ success: true, challenges: formattedChallenges });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.createChallenge = async (req, res) => {
    try {
        const { challengerId, challengerName, challengerRole, type, map, message, targetId, proposedTime } = req.body;

        const user = await User.findById(challengerId);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        // Validate time (Must be at least 2 hours in the future)
        if (proposedTime) {
            const pTime = new Date(proposedTime);
            const minTime = new Date();
            minTime.setHours(minTime.getHours() + 2);
            if (pTime < minTime) {
                return res.status(400).json({ success: false, message: 'Match must be scheduled at least 2 hours in advance' });
            }
        }

        // Check Membership and Limits
        if (!user.membership?.expiresAt || new Date(user.membership.expiresAt) < new Date()) {
            return res.status(403).json({ success: false, message: 'Active membership required to create challenges' });
        }

        const plan = await mongoose.model('MembershipPlan').findById(user.membership.planId);
        const limit = plan?.challengeLimit || 0;

        // Reset limit if it's a new month
        const lastReset = user.membership.lastChallengeReset ? new Date(user.membership.lastChallengeReset) : new Date();
        const now = new Date();
        if (now.getTime() - lastReset.getTime() > 30 * 24 * 60 * 60 * 1000) {
            user.membership.challengesUsed = 0;
            user.membership.lastChallengeReset = now;
        }

        if (user.membership.challengesUsed >= limit) {
            return res.status(403).json({ success: false, message: `Challenge limit reached (${limit}/${limit} per month)` });
        }

        // Increment Used Challenges
        user.membership.challengesUsed += 1;
        await user.save();

        const challenge = new Challenge({
            challengerId,
            challengerName,
            challengerRole,
            type,
            wager: 0,
            map,
            message,
            targetId, // New field
            proposedTime: proposedTime ? new Date(proposedTime) : null,
            status: 'Open',
            time: new Date().toLocaleTimeString()
        });

        await challenge.save();

        res.status(201).json({ success: true, challenge: { ...challenge.toObject(), id: challenge._id.toString() } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.acceptChallenge = async (req, res) => {
    try {
        const { challengeId, acceptorId, acceptorName, acceptorRole } = req.body;

        const challenge = await Challenge.findById(challengeId);
        if (!challenge) return res.status(404).json({ success: false, message: 'Challenge not found' });
        if (challenge.status !== 'Open') return res.status(400).json({ success: false, message: 'Challenge no longer open' });

        const user = await User.findById(acceptorId);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        // Check Membership
        if (!user.membership?.expiresAt || new Date(user.membership.expiresAt) < new Date()) {
            return res.status(403).json({ success: false, message: 'Active membership required to accept challenges' });
        }

        // Check Challenge Limit for Acceptor
        const plan = await mongoose.model('MembershipPlan').findById(user.membership.planId);
        const limit = plan?.challengeLimit || 0;
        const lastReset = user.membership.lastChallengeReset ? new Date(user.membership.lastChallengeReset) : new Date();
        const now = new Date();

        if (now.getTime() - lastReset.getTime() > 30 * 24 * 60 * 60 * 1000) {
            user.membership.challengesUsed = 0;
            user.membership.lastChallengeReset = now;
        }

        if (user.membership.challengesUsed >= limit) {
            return res.status(403).json({ success: false, message: `Challenge limit reached (${limit}/${limit} per month)` });
        }

        user.membership.challengesUsed += 1;
        await user.save();

        challenge.status = 'PendingAdmin'; // Now goes to admin for approval
        challenge.acceptorId = acceptorId;
        challenge.acceptorName = acceptorName;
        challenge.acceptorRole = acceptorRole;

        await challenge.save();

        res.json({ success: true, message: 'Challenge accepted. Pending admin scheduling.', challenge });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.deleteChallenge = async (req, res) => {
    try {
        await Challenge.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Challenge deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.updateChallenge = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const challenge = await Challenge.findByIdAndUpdate(id, updates, { new: true });
        if (!challenge) return res.status(404).json({ success: false, message: 'Challenge not found' });
        res.json({ success: true, challenge });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
