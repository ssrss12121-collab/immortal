const mongoose = require('mongoose');
const Tournament = require('../models/Tournament');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const { News, MVP } = require('../models/News');
const cache = require('../scripts/cacheService');

exports.getTournaments = async (req, res) => {
    try {
        const cacheKey = 'tournaments_list';
        const cachedData = cache.get(cacheKey);

        if (cachedData) {
            return res.json({ success: true, tournaments: cachedData, fromCache: true });
        }

        const tournaments = await Tournament.find()
            .sort({ createdAt: -1 })
            .select('-participants -matchResult.scores') // Reduced payload for list view
            .lean();

        // Map _id to id for frontend compatibility
        const formattedTournaments = tournaments.map(t => ({
            ...t,
            id: t._id.toString()
        }));

        cache.set(cacheKey, formattedTournaments, 60); // Cache for 60 seconds
        res.json({ success: true, tournaments: formattedTournaments });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.saveTournament = async (req, res) => {
    try {
        const { id, ...tournamentData } = req.body;
        let tournament;

        if (id && mongoose.Types.ObjectId.isValid(id)) {
            tournament = await Tournament.findByIdAndUpdate(id, tournamentData, { new: true });
        } else {
            tournament = new Tournament(tournamentData);
            await tournament.save();
        }

        cache.del('tournaments_list'); // Invalidate cache

        const formattedTournament = {
            ...tournament.toObject(),
            id: tournament._id.toString()
        };
        res.json({ success: true, tournament: formattedTournament });
    } catch (err) {
        console.error('❌ Save Tournament Error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.deleteTournament = async (req, res) => {
    try {
        await Tournament.findByIdAndDelete(req.params.id);
        cache.del('tournaments_list'); // Invalidate cache
        res.json({ success: true, message: 'Tournament deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.joinTournament = async (req, res) => {
    try {
        const { tournamentId, userId, teamMembers } = req.body;

        const tournament = await Tournament.findById(tournamentId);
        if (!tournament) return res.status(404).json({ success: false, message: 'Tournament not found' });

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        if (tournament.participants.some(p => p.id === userId)) {
            return res.status(400).json({ success: false, message: 'Already joined' });
        }

        if (tournament.filledSlots >= tournament.slots) {
            return res.status(400).json({ success: false, message: 'Tournament full' });
        }

        if (tournament.isPremium) {
            const hasSub = user.subscription?.expiresAt && new Date(user.subscription.expiresAt) > new Date();
            if (!hasSub) {
                return res.status(403).json({ success: false, message: 'Premium match requires active subscription' });
            }
        }

        // Add Participant
        const participant = {
            id: userId,
            name: user.ign,
            avatar: user.avatarUrl,
            isTeam: !!teamMembers && teamMembers.length > 0,
            teamName: teamMembers && teamMembers.length > 0 ? `${user.ign}'s Team` : undefined,
            members: teamMembers
        };

        tournament.participants.push(participant);
        tournament.filledSlots += 1;
        await tournament.save();

        res.json({ success: true, message: 'Joined successfully' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.restartTournament = async (req, res) => {
    try {
        const { id } = req.params;
        const tournament = await Tournament.findById(id);
        if (!tournament) return res.status(404).json({ success: false, message: 'Tournament not found' });

        tournament.participants = [];
        tournament.filledSlots = 0;
        tournament.status = 'Open';
        await tournament.save();

        res.json({ success: true, message: 'Tournament restarted successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.rematchTournament = async (req, res) => {
    try {
        const { id } = req.params;
        const original = await Tournament.findById(id);
        if (!original) return res.status(404).json({ success: false, message: 'Tournament not found' });

        const rematch = new Tournament({
            ...original.toObject(),
            _id: undefined,
            title: `${original.title} (Rematch)`,
            participants: [],
            filledSlots: 0,
            status: 'Open',
            createdAt: undefined,
            updatedAt: undefined
        });

        await rematch.save();
        res.json({ success: true, message: 'Rematch created successfully', tournament: rematch });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.publishResults = async (req, res) => {
    try {
        const { tournamentId, results } = req.body;
        const { scores, mvpId, publishBanner } = results;

        const tournament = await Tournament.findById(tournamentId);
        if (!tournament) return res.status(404).json({ success: false, message: 'Tournament not found' });
        if (tournament.matchResult?.published) return res.status(400).json({ success: false, message: 'Already published' });

        tournament.matchResult = {
            scores: Object.entries(scores).map(([id, s]) => ({
                participantId: id,
                kills: s.kills || 0,
                position: s.position || 0,
                totalPoints: (s.rankPoints || 0) + (s.kills || 0)
            })),
            mvpId,
            published: true,
            publishBanner
        };
        tournament.status = 'Completed';
        await tournament.save();

        if (req.io) req.io.emit('tournament-updated', tournament);

        for (const [userId, score] of Object.entries(scores)) {
            const user = await User.findById(userId);
            if (!user) continue;

            user.stats = user.stats || { kills: 0, wins: 0, matches: 0 };
            user.stats.kills += (score.kills || 0);
            user.stats.matches += 1;
            if (score.position === 1) user.stats.wins += 1;

            // Payout logic removed as per user request (no more wallet balance)

            user.matchHistory = user.matchHistory || [];
            user.matchHistory.push({
                tournamentId,
                tournamentTitle: tournament.title,
                kills: score.kills,
                position: score.position,
                prize: 0,
                date: new Date()
            });

            await user.save();
        }

        if (publishBanner && mvpId) {
            const mvpUser = await User.findById(mvpId);
            if (mvpUser) {
                const mvpEntry = new MVP({
                    userId: mvpId,
                    name: mvpUser.ign,
                    image: mvpUser.avatarUrl,
                    description: `Tournament Champion of ${tournament.title}`,
                    role: mvpUser.gameRole || 'Rusher',
                    stats: mvpUser.stats
                });
                await mvpEntry.save();
            }
        }

        res.json({ success: true, tournament });
    } catch (err) {
        console.error('❌ Publish Results Error:', err);
        res.status(500).json({
            success: false,
            message: 'Server error while publishing results',
            details: err.message
        });
    }
};
