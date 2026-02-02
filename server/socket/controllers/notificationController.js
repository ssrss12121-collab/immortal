const Notification = require('../models/Notification');

exports.getNotifications = async (req, res) => {
    try {
        let userId = req.params.userId;
        const mongoose = require('mongoose');
        const User = require('../models/User');

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            const user = await User.findOne({
                $or: [{ playerId: userId }, { ign: userId }]
            });
            if (user) userId = user._id;
            else return res.json({ success: true, notifications: [] });
        }

        const notifications = await Notification.find({ userId }).sort({ createdAt: -1 });
        res.json({ success: true, notifications });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.getInvites = async (req, res) => {
    try {
        let userId = req.params.userId;
        const mongoose = require('mongoose');
        const User = require('../models/User');

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            const user = await User.findOne({
                $or: [{ playerId: userId }, { ign: userId }]
            });
            if (user) userId = user._id;
            else return res.json({ success: true, invites: [] });
        }

        const invites = await Notification.find({ userId, type: 'TEAM_INVITE' }).sort({ createdAt: -1 });
        // Transform for frontend if needed (TeamManager expects specific structure)
        const formattedInvites = invites.map(inv => ({
            id: inv._id,
            teamId: inv.data.teamId,
            teamName: inv.data.teamName,
            senderId: 'System', // Metadata might be missing, but 'data' usually has it if structured well
            teamLogo: '', // Not stored in notification, might need populate or separate fetch. keeping simple for now.
            message: inv.message
        }));

        res.json({ success: true, invites: formattedInvites });
    } catch (err) {
        console.error("getInvites error:", err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.markAsRead = async (req, res) => {
    try {
        await Notification.findByIdAndUpdate(req.params.id, { read: true });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.deleteNotification = async (req, res) => {
    try {
        await Notification.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.sendNotification = async (req, res) => {
    try {
        const { userId, title, message, type, data } = req.body;
        const notification = new Notification({ userId, title, message, type, data });
        await notification.save();

        res.json({ success: true, notification });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.broadcastNotification = async (req, res) => {
    try {
        const { title, message, type, data } = req.body;
        const User = require('../models/User');
        const users = await User.find({}, '_id');

        const notifications = users.map(user => ({
            userId: user._id,
            title,
            message,
            type: type || 'SYSTEM',
            data
        }));

        await Notification.insertMany(notifications);

        res.json({ success: true, count: users.length });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
