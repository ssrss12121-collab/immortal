const express = require('express');
const router = express.Router();
const socialController = require('../controllers/socialController');
const { protect } = require('../middleware/authMiddleware'); // Assuming authMiddleware exists

router.post('/follow/:id', protect, socialController.followUser);
router.post('/unfollow/:id', protect, socialController.unfollowUser);
router.get('/stats/:id', socialController.getFollowStats);

module.exports = router;
