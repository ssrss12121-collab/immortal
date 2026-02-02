const express = require('express');
const router = express.Router();
const liveController = require('../controllers/liveController');
const { protect } = require('../middleware/authMiddleware');

// Live session management
router.post('/start', protect, liveController.startLive);
router.get('/active', protect, liveController.getActiveLives);
router.get('/:sessionId', protect, liveController.getLiveSession);
router.post('/:sessionId/end', protect, liveController.endLive);

// Voice seated - seat management
router.post('/:sessionId/seats/join', protect, liveController.joinSeat);
router.post('/:sessionId/seats/leave', protect, liveController.leaveSeat);

// Viewer management
router.post('/:sessionId/viewers/join', protect, liveController.joinAsViewer);
router.post('/:sessionId/viewers/leave', protect, liveController.leaveAsViewer);

// Reactions
router.post('/:sessionId/reactions', protect, liveController.addReaction);

module.exports = router;
