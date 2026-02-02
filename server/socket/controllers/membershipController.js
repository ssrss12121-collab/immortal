const MembershipPlan = require('../models/MembershipPlan');
const User = require('../models/User');

exports.getPlans = async (req, res) => {
    try {
        const plans = await MembershipPlan.find({ isActive: true });
        res.json({ success: true, plans });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.createPlan = async (req, res) => {
    try {
        const plan = new MembershipPlan(req.body);
        await plan.save();
        res.status(201).json({ success: true, plan });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.buyMembership = async (req, res) => {
    try {
        const { userId, planId, durationDays } = req.body;
        const user = await User.findById(userId);
        const plan = await MembershipPlan.findById(planId);

        if (!user || !plan) return res.status(404).json({ success: false, message: 'User or Plan not found' });

        const days = durationDays || plan.durationDays || 30;
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + parseInt(days));

        user.membership = {
            planId: plan._id,
            expiresAt: expiryDate,
            type: plan.type,
            challengesUsed: 0,
            lastChallengeReset: new Date()
        };

        await user.save();

        res.json({ success: true, message: 'Membership activated!', membership: user.membership });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.adminUpdatePlan = async (req, res) => {
    try {
        const { id } = req.params;
        const plan = await MembershipPlan.findByIdAndUpdate(id, req.body, { new: true });
        res.json({ success: true, plan });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.deletePlan = async (req, res) => {
    try {
        await MembershipPlan.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Plan deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.assignSubscription = async (req, res) => {
    try {
        const { userId, planId, durationDaysOverride } = req.body;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        const plan = await MembershipPlan.findById(planId);
        if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' });

        const duration = durationDaysOverride || plan.durationDays;
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + parseInt(duration));

        user.membership = {
            planId: plan._id,
            expiresAt: expiresAt,
            type: plan.type,
            challengesUsed: 0,
            lastChallengeReset: new Date()
        };

        await user.save();

        res.json({ success: true, message: `Subscription assigned until ${expiresAt.toDateString()}`, user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Failed to assign subscription' });
    }
};

exports.getUserByPlayerId = async (req, res) => {
    try {
        const { playerIdToken } = req.params;
        const mongoose = require('mongoose');
        // Search by either _id or playerId (custom ID) or email
        const user = await User.findOne({
            $or: [
                { _id: mongoose.isValidObjectId(playerIdToken) ? playerIdToken : null },
                { playerId: playerIdToken },
                { email: playerIdToken }
            ]
        });

        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        res.json({
            success: true, user: {
                id: user._id,
                ign: user.ign,
                email: user.email,
                playerId: user.playerId,
                membership: user.membership,
                role: user.gameRole
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Search failed' });
    }
};
