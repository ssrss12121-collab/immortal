const LiveSession = require('../models/LiveSession');
const Guild = require('../models/Guild');
const Channel = require('../models/Channel');
const Group = require('../models/Group');

// Start a new live session
exports.startLive = async (req, res) => {
    try {
        const { title, liveType, sourceType, sourceId, description, thumbnailUrl, isPublic, maxSeats } = req.body;
        const hostId = req.user.id;

        // Verify source exists and user has permission
        let source;
        let guild;
        
        if (sourceType === 'Channel') {
            source = await Channel.findById(sourceId);
            if (!source) return res.status(404).json({ success: false, message: 'Channel not found' });
            
            guild = await Guild.findById(source.guildId);
            if (!guild) return res.status(404).json({ success: false, message: 'Guild not found' });
            
            // Check permission
            if (!guild.hasPermission(hostId, 'canStartLive') && guild.ownerId.toString() !== hostId) {
                return res.status(403).json({ success: false, message: 'You do not have permission to start live in this channel' });
            }
            
        } else if (sourceType === 'Group') {
            source = await Group.findById(sourceId);
            if (!source) return res.status(404).json({ success: false, message: 'Group not found' });
            
            guild = await Guild.findById(source.guildId);
            
            // Check if user is member of group
            if (!source.isMember(hostId)) {
                return res.status(403).json({ success: false, message: 'You are not a member of this group' });
            }
            
        } else if (sourceType === 'Guild') {
            guild = await Guild.findById(sourceId);
            if (!guild) return res.status(404).json({ success: false, message: 'Guild not found' });
            
            // Check permission
            if (!guild.hasPermission(hostId, 'canStartLive') && guild.ownerId.toString() !== hostId) {
                return res.status(403).json({ success: false, message: 'You do not have permission to start live in this guild' });
            }
        }

        // Create live session
        const session = new LiveSession({
            hostId,
            liveType,
            sourceType,
            sourceId: sourceType !== 'Public' ? sourceId : undefined,
            title,
            description,
            thumbnailUrl,
            isPublic: isPublic !== undefined ? isPublic : true,
            maxSeats: liveType === 'VoiceSeated' ? (maxSeats || 12) : 0,
            seats: [],
            viewers: [],
            reactions: []
        });

        await session.save();

        // Update source with active live session
        if (sourceType === 'Channel') {
            source.activeLiveSessionId = session._id;
            source.isLive = true;
            source.totalLives++;
            await source.save();
        } else if (sourceType === 'Group') {
            source.activeLiveSessionId = session._id;
            source.isLive = true;
            await source.save();
        } else if (sourceType === 'Guild') {
            guild.totalLives++;
            await guild.save();
        }

        res.status(201).json({ 
            success: true, 
            message: 'Live session started successfully',
            session 
        });
    } catch (error) {
        console.error('Start live error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to start live',
            error: error.message 
        });
    }
};

// Get active public live sessions
exports.getActiveLives = async (req, res) => {
    try {
        const { type } = req.query; // video, voiceseated, voicefree

        let query = { status: 'Live', isPublic: true };
        if (type) {
            const typeMap = {
                'video': 'Video',
                'voiceseated': 'VoiceSeated',
                'voicefree': 'VoiceFree'
            };
            query.liveType = typeMap[type.toLowerCase()];
        }

        const lives = await LiveSession.find(query)
            .populate('hostId', 'username ign avatar avatarUrl')
            .populate('sourceId')
            .sort({ startedAt: -1 })
            .limit(50);

        res.json({ success: true, lives });
    } catch (error) {
        console.error('Get active lives error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to get lives',
            error: error.message 
        });
    }
};

// Get live session details
exports.getLiveSession = async (req, res) => {
    try {
        const { sessionId } = req.params;

        const session = await LiveSession.findById(sessionId)
            .populate('hostId', 'username ign avatar avatarUrl')
            .populate('seats.userId', 'username ign avatar avatarUrl')
            .populate('viewers', 'username ign avatar avatarUrl')
            .populate('sourceId');

        if (!session) {
            return res.status(404).json({ success: false, message: 'Session not found' });
        }

        res.json({ success: true, session });
    } catch (error) {
        console.error('Get live session error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to get session',
            error: error.message 
        });
    }
};

// Join a voice seated live (take a seat)
exports.joinSeat = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { position } = req.body;
        const userId = req.user.id;

        const session = await LiveSession.findById(sessionId);
        if (!session) return res.status(404).json({ success: false, message: 'Session not found' });
        
        if (session.status !== 'Live') {
            return res.status(400).json({ success: false, message: 'Session has ended' });
        }
        
        if (session.liveType !== 'VoiceSeated') {
            return res.status(400).json({ success: false, message: 'Not a voice seated session' });
        }

        const success = session.joinSeat(userId, position);
        if (!success) {
            return res.status(400).json({ 
                success: false, 
                message: 'Could not join seat. It may be full or you are already seated.' 
            });
        }

        await session.save();

        res.json({ 
            success: true, 
            message: 'Joined seat successfully',
            session 
        });
    } catch (error) {
        console.error('Join seat error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to join seat',
            error: error.message 
        });
    }
};

// Leave a voice seated live (leave seat)
exports.leaveSeat = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const userId = req.user.id;

        const session = await LiveSession.findById(sessionId);
        if (!session) return res.status(404).json({ success: false, message: 'Session not found' });

        const success = session.leaveSeat(userId);
        if (!success) {
            return res.status(400).json({ 
                success: false, 
                message: 'You are not in a seat' 
            });
        }

        await session.save();

        res.json({ 
            success: true, 
            message: 'Left seat successfully',
            session 
        });
    } catch (error) {
        console.error('Leave seat error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to leave seat',
            error: error.message 
        });
    }
};

// Add a reaction to live
exports.addReaction = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { type } = req.body; // like, love, fire, clap, wow
        const userId = req.user.id;

        const session = await LiveSession.findById(sessionId);
        if (!session) return res.status(404).json({ success: false, message: 'Session not found' });

        if (!session.allowReactions) {
            return res.status(400).json({ success: false, message: 'Reactions are disabled for this live' });
        }

        session.addReaction(userId, type);
        await session.save();

        res.json({ 
            success: true, 
            message: 'Reaction added',
            reactionCounts: session.reactionCounts 
        });
    } catch (error) {
        console.error('Add reaction error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to add reaction',
            error: error.message 
        });
    }
};

// Join as viewer
exports.joinAsViewer = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const userId = req.user.id;

        const session = await LiveSession.findById(sessionId);
        if (!session) return res.status(404).json({ success: false, message: 'Session not found' });

        if (session.status !== 'Live') {
            return res.status(400).json({ success: false, message: 'Session has ended' });
        }

        session.addViewer(userId);
        await session.save();

        res.json({ 
            success: true, 
            message: 'Joined as viewer',
            viewersCount: session.viewersCount 
        });
    } catch (error) {
        console.error('Join viewer error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to join as viewer',
            error: error.message 
        });
    }
};

// Leave as viewer
exports.leaveAsViewer = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const userId = req.user.id;

        const session = await LiveSession.findById(sessionId);
        if (!session) return res.status(404).json({ success: false, message: 'Session not found' });

        session.removeViewer(userId);
        await session.save();

        res.json({ 
            success: true, 
            message: 'Left as viewer',
            viewersCount: session.viewersCount 
        });
    } catch (error) {
        console.error('Leave viewer error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to leave',
            error: error.message 
        });
    }
};

// End live session
exports.endLive = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const userId = req.user.id;

        const session = await LiveSession.findById(sessionId);
        if (!session) return res.status(404).json({ success: false, message: 'Session not found' });

        // Only host can end
        if (session.hostId.toString() !== userId) {
            return res.status(403).json({ 
                success: false, 
                message: 'Only the host can end the live session' 
            });
        }

        session.endSession();
        await session.save();

        // Clear live status from source
        if (session.sourceType === 'Channel') {
            await Channel.findByIdAndUpdate(session.sourceId, { 
                $unset: { activeLiveSessionId: "" },
                isLive: false 
            });
        } else if (session.sourceType === 'Group') {
            await Group.findByIdAndUpdate(session.sourceId, { 
                $unset: { activeLiveSessionId: "" },
                isLive: false 
            });
        }

        res.json({ 
            success: true, 
            message: 'Live session ended',
            duration: session.duration 
        });
    } catch (error) {
        console.error('End live error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to end live',
            error: error.message 
        });
    }
};
