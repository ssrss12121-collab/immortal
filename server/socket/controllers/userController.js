const User = require('../models/User');
const cache = require('../scripts/cacheService');


exports.getFeaturedPlayers = async (req, res) => {
    try {
        const { ids } = req.query;
        if (!ids) return res.json({ success: true, users: [] });

        const idArray = ids.split(',').filter(id => require('mongoose').Types.ObjectId.isValid(id));

        const cacheKey = `featured_users_${idArray.sort().join('_')}`;
        const cachedData = cache.get(cacheKey);
        if (cachedData) return res.json({ success: true, users: cachedData, fromCache: true });

        const users = await User.find({ _id: { $in: idArray } })
            .select('ign email playerId gameRole district experience subscription isActive stats avatarUrl')
            .lean();

        const formattedUsers = users.map(user => ({
            ...user,
            id: user._id.toString(),
            name: user.name || 'Unknown',
            role: user.gameRole || 'Rusher',
            isActive: user.isActive !== false
        }));

        cache.set(cacheKey, formattedUsers, 60); // Cache for 1 minute
        res.json({ success: true, users: formattedUsers });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        const cacheKey = 'users_list_all';
        const cachedData = cache.get(cacheKey);

        if (cachedData) {
            return res.json({ success: true, users: cachedData, fromCache: true });
        }

        const users = await User.find()
            .select('ign email playerId gameRole district experience subscription isActive stats') // No password, no matchHistory (too large)
            .lean();

        const formattedUsers = users.map(user => ({
            ...user,
            id: user._id.toString(),
            name: user.name || 'Unknown',
            role: user.gameRole || 'Rusher',
            isActive: user.isActive !== false
        }));

        cache.set(cacheKey, formattedUsers, 30); // Cache for 30 seconds
        res.json({ success: true, users: formattedUsers });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.getUserById = async (req, res) => {
    try {
        let user;
        if (require('mongoose').Types.ObjectId.isValid(req.params.id)) {
            user = await User.findById(req.params.id).select('-password');
        }

        // If not found by _id or invalid _id, try finding by playerId
        if (!user) {
            user = await User.findOne({ playerId: req.params.id }).select('-password');
        }

        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        res.json({
            success: true,
            user: {
                id: user._id,
                playerId: user.playerId,
                ign: user.ign,
                email: user.email,
                name: user.name,
                role: user.gameRole,
                district: user.district,
                experience: user.experience,
                subscription: user.subscription,
                isActive: user.isActive !== false,
                stats: user.stats,
                matchHistory: user.matchHistory
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        const updates = req.body;
        // Don't allow password update here for now
        delete updates.password;

        Object.assign(user, updates);
        await user.save();

        res.json({
            success: true,
            user: {
                id: user._id,
                ign: user.ign,
                email: user.email,
                role: user.gameRole,
                district: user.district,
                experience: user.experience,
                subscription: user.subscription,
                stats: user.stats
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.updateUserRole = async (req, res) => {
    try {
        const { userId, role } = req.body;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        user.gameRole = role;
        await user.save();

        res.json({ success: true, message: 'Role updated' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.adminUpdateUser = async (req, res) => {
    try {
        const { userId, updates } = req.body;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        // Apply updates
        if (updates.membership) {
            user.membership = { ...user.membership?.toObject(), ...updates.membership };
        }
        if (updates.stats) {
            user.stats = { ...user.stats.toObject(), ...updates.stats };
        }
        if (updates.ign) user.ign = updates.ign;
        if (updates.email) user.email = updates.email;
        if (updates.gameRole) user.gameRole = updates.gameRole;
        if (updates.experience) user.experience = updates.experience;
        if (updates.name) user.name = updates.name;
        if (updates.country) user.country = updates.country;
        if (updates.district) user.district = updates.district;

        await user.save();
        res.json({ success: true, message: 'User updated successfully', user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.banUser = async (req, res) => {
    try {
        const { userId } = req.body;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        user.isActive = false;
        await user.save();

        res.json({ success: true, message: 'User banned' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.updateBalance = async (req, res) => {
    try {
        const { userId, amount } = req.body;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        user.walletBalance = amount;
        await user.save();

        res.json({ success: true, message: 'Balance updated', balance: user.walletBalance });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.correctStats = async (req, res) => {
    try {
        const { userId, tournamentId, oldStats, newStats } = req.body;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        // Correct aggregate stats
        user.stats = user.stats || { kills: 0, wins: 0, matches: 0 };
        user.stats.kills = (user.stats.kills - (oldStats.kills || 0)) + (newStats.kills || 0);
        if (oldStats.isWin) user.stats.wins -= 1;
        if (newStats.isWin) user.stats.wins += 1;

        // Correct match history entry
        if (user.matchHistory) {
            const historyIndex = user.matchHistory.findIndex(h => h.tournamentId === tournamentId);
            if (historyIndex !== -1) {
                user.matchHistory[historyIndex].kills = newStats.kills;
                user.matchHistory[historyIndex].position = newStats.position;
                // Note: We don't automatically adjust prize here as it's a separate transaction, 
                // but we update the display record.
            }
        }

        await user.save();
        res.json({ success: true, user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.deleteMatchHistory = async (req, res) => {
    try {
        const { tournamentId } = req.params;
        const { userId } = req.body; // Optional: If specific user, else all users

        if (userId) {
            const user = await User.findById(userId);
            if (user && user.matchHistory) {
                user.matchHistory = user.matchHistory.filter(h => h.tournamentId !== tournamentId);
                await user.save();
            }
        } else {
            // Delete from all users
            await User.updateMany(
                { 'matchHistory.tournamentId': tournamentId },
                { $pull: { matchHistory: { tournamentId: tournamentId } } }
            );
        }

        res.json({ success: true, message: 'Match history deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
