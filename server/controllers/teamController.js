const Team = require('../models/Team');
const User = require('../models/User');
const Notification = require('../models/Notification');
const Message = require('../models/Message');
const mongoose = require('mongoose');

exports.getTeams = async (req, res) => {
    try {
        const teams = await Team.find().sort({ rankPoints: -1 });
        res.json({ success: true, teams });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.createTeam = async (req, res) => {
    try {
        const { name, shortName, captainId, logoUrl, country, district } = req.body;

        // Resolve user correctly
        const user = await User.findOne({
            $or: [
                { _id: mongoose.Types.ObjectId.isValid(captainId) ? captainId : null },
                { playerId: captainId }
            ]
        });

        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        const resolvedCaptainId = user._id;

        // Check if user already has a team
        const existingTeam = await Team.findOne({
            $or: [{ captainId: resolvedCaptainId }, { 'members.id': resolvedCaptainId }]
        });

        if (existingTeam) {
            return res.status(400).json({ success: false, message: 'User is already in a team' });
        }

        // Calculate 3-month lock if user has deleted a team before
        let canDeleteAt = null;
        if (user.lastTeamDeletedAt) {
            canDeleteAt = new Date(Date.now() + (90 * 24 * 60 * 60 * 1000)); // 3 months
        }

        const newTeam = new Team({
            name,
            shortName,
            captainId: resolvedCaptainId,
            leaderId: resolvedCaptainId,
            logoUrl,
            bannerUrl: req.body.bannerUrl || '',
            country: country || user.country || 'Bangladesh',
            district,
            canDeleteAt,
            members: [{
                id: user._id,
                playerId: user.playerId,
                name: user.name || user.ign,
                ign: user.ign,
                email: user.email,
                role: user.gameRole,
                country: user.country,
                district: user.district
            }]
        });

        await newTeam.save();

        // Update user's teamId
        user.teamId = newTeam._id;
        await user.save();

        res.status(201).json({ success: true, team: newTeam });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.getTeamById = async (req, res) => {
    try {
        const team = await Team.findById(req.params.id);
        if (!team) return res.status(404).json({ success: false, message: 'Team not found' });
        res.json({ success: true, team });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.getTeamByUserId = async (req, res) => {
    try {
        let queryId = req.params.userId;

        // If not a valid ObjectId, try to resolve it from playerId or ign
        if (!mongoose.Types.ObjectId.isValid(queryId)) {
            const user = await User.findOne({
                $or: [{ playerId: queryId }, { ign: queryId }]
            });
            if (user) {
                queryId = user._id;
            } else {
                // If user not found by ID/IGN, we probably won't find a team, but let the query run or return null
                return res.json({ success: true, team: null });
            }
        }

        const team = await Team.findOne({ 'members.id': queryId });
        res.json({ success: true, team });
    } catch (err) {
        console.error("getTeamByUserId error:", err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
}

exports.inviteMember = async (req, res) => {
    try {
        const { teamId, receiverId, message } = req.body;

        const team = await Team.findById(teamId);
        if (!team) return res.status(404).json({ success: false, message: 'Team not found' });

        // Resolve receiver by either _id or playerId
        let recipient = await User.findOne({
            $or: [
                { _id: mongoose.Types.ObjectId.isValid(receiverId) ? receiverId : null },
                { playerId: receiverId }
            ]
        });

        if (!recipient) {
            return res.status(404).json({ success: false, message: 'Player not found with this ID' });
        }

        const notification = new Notification({
            userId: recipient._id.toString(),
            title: 'Squad Invitation',
            message: message || `You have been recruited to join ${team.name}.`,
            type: 'TEAM_INVITE',
            data: { teamId: team._id, teamName: team.name }
        });

        await notification.save();
        res.json({ success: true, message: 'Invitation sent' });

    } catch (err) {
        console.error('Invite error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.acceptInvite = async (req, res) => {
    try {
        const { teamId, userId, notificationId } = req.body;

        const team = await Team.findById(teamId);
        if (!team) return res.status(404).json({ success: false, message: 'Team not found' });

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        // Add to team members
        if (!team.members.some(m => m.id.toString() === userId)) {
            team.members.push({
                id: user._id,
                playerId: user.playerId,
                name: user.name || user.ign,
                ign: user.ign,
                email: user.email,
                role: user.gameRole,
                country: user.country,
                district: user.district
            });
            await team.save();
        }

        // Update user profile
        user.teamId = teamId;
        await user.save();

        // Mark notification as read or delete it
        if (notificationId) {
            await Notification.findByIdAndDelete(notificationId);
        }

        // Notify team via socket
        if (req.io) {
            req.io.to(`team_${teamId}`).emit('team-updated', team);
        }

        res.json({ success: true, message: 'Joined team successfully', team });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.rejectInvite = async (req, res) => {
    try {
        const { notificationId } = req.params;
        await Notification.findByIdAndDelete(notificationId);
        res.json({ success: true, message: 'Invite rejected' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.kickMember = async (req, res) => {
    try {
        const { teamId, memberId } = req.body;
        const team = await Team.findById(teamId);
        if (!team) return res.status(404).json({ success: false, message: 'Team not found' });

        team.members = team.members.filter(m => m.id.toString() !== memberId);
        await team.save();

        const user = await User.findById(memberId);
        if (user) {
            user.teamId = undefined;
            await user.save();
        }

        res.json({ success: true, message: 'Member kicked' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateTeam = async (req, res) => {
    try {
        const { teamId } = req.params;
        const updates = req.body;
        console.log(`[DEBUG] Updating team ${teamId}`, Object.keys(updates));

        const team = await Team.findByIdAndUpdate(teamId, updates, { new: true });
        if (!team) return res.status(404).json({ success: false, message: 'Team not found' });

        // Update members list if logo or shortName changed (optional but good for denormalized consistency)
        if (updates.logoUrl || updates.shortName) {
            // Logic to update other references if needed
        }

        // Notify team via socket
        if (req.io) {
            req.io.to(`team_${teamId}`).emit('team-updated', team);
        }

        res.json({ success: true, team });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteTeam = async (req, res) => {
    try {
        const { id } = req.params;
        const team = await Team.findById(id);

        if (!team) return res.status(404).json({ success: false, message: 'Squad not found' });

        // Check 3-month lock
        if (team.canDeleteAt && team.canDeleteAt > new Date()) {
            const daysLeft = Math.ceil((team.canDeleteAt - new Date()) / (1000 * 60 * 60 * 24));
            return res.status(403).json({
                success: false,
                message: `This squad is battle-locked. You can disband in ${daysLeft} days.`
            });
        }

        const captainId = team.captainId;

        // Reset all members
        const memberIds = team.members.map(m => m.id);
        await User.updateMany(
            { _id: { $in: memberIds } },
            { $unset: { teamId: "" } }
        );

        // Track deletion for the captain
        await User.findByIdAndUpdate(captainId, { lastTeamDeletedAt: new Date() });

        // Delete all messages
        await Message.deleteMany({ teamId: team._id });

        // Delete team
        await Team.findByIdAndDelete(id);

        res.json({ success: true, message: 'Squad disbanded and history cleared.' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error during disband' });
    }
};

exports.transferLeadership = async (req, res) => {
    try {
        const { teamId, newLeaderId } = req.body;
        const team = await Team.findById(teamId);
        if (!team) return res.status(404).json({ success: false, message: 'Team not found' });

        // Update leaderId
        team.leaderId = newLeaderId;

        // Also update captainId if we want them to have full control
        team.captainId = newLeaderId;

        await team.save();

        // Notify team via socket
        if (req.io) {
            req.io.to(`team_${teamId}`).emit('team-updated', team);
        }

        res.json({ success: true, message: 'Leadership and Command transferred.' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.correctStats = async (req, res) => {
    try {
        const { teamId, tournamentId, oldStats, newStats } = req.body;
        const team = await Team.findById(teamId);
        if (!team) return res.status(404).json({ success: false, message: 'Team not found' });

        // Correct aggregate stats
        team.stats = team.stats || { matches: 0, wins: 0, totalKills: 0 };
        team.stats.totalKills = (team.stats.totalKills - (oldStats.totalKills || 0)) + (newStats.totalKills || 0);
        if (oldStats.isWin) team.stats.wins -= 1;
        if (newStats.isWin) team.stats.wins += 1;

        // Correct match history entry
        if (team.matchHistory) {
            const historyIndex = team.matchHistory.findIndex(h => h.tournamentId === tournamentId);
            if (historyIndex !== -1) {
                team.matchHistory[historyIndex].totalKills = newStats.totalKills;
                team.matchHistory[historyIndex].position = newStats.position;
            }
        }

        await team.save();
        res.json({ success: true, team });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.deleteMatchHistory = async (req, res) => {
    try {
        const { tournamentId } = req.params;
        const { teamId } = req.body;

        if (teamId) {
            const team = await Team.findById(teamId);
            if (team && team.matchHistory) {
                team.matchHistory = team.matchHistory.filter(h => h.tournamentId !== tournamentId);
                await team.save();
            }
        } else {
            // Delete from all teams
            await Team.updateMany(
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
