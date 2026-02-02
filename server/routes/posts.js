const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { protect } = require('../middleware/authMiddleware');

// Post management
router.get('/:postId', protect, postController.getPost);
router.put('/:postId', protect, postController.editPost);
router.delete('/:postId', protect, postController.deletePost);
router.post('/:postId/pin', protect, postController.pinPost);

// Reactions
router.post('/:postId/reactions', protect, postController.addReactionToPost);

// Guild announcements (channelId = null)
router.get('/guild/:guildId/announcements', protect, postController.getGuildAnnouncements);
router.post('/guild/:guildId/announcements', protect, postController.createAnnouncement);

module.exports = router;
