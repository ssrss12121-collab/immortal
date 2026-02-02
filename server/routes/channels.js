const express = require('express');
const router = express.Router();
const channelController = require('../controllers/channelController');
const { protect } = require('../middleware/authMiddleware');

// Channel management
router.get('/:channelId', protect, channelController.getChannel);
router.put('/:channelId', protect, channelController.editChannel);
router.delete('/:channelId', protect, channelController.deleteChannel);

// Channel admin/permissions
router.post('/:channelId/admins', protect, channelController.addChannelAdmin);
router.delete('/:channelId/permissions', protect, channelController.removeChannelPermission);

// Channel posts
router.get('/:channelId/posts', protect, channelController.getChannelPosts);
router.post('/:channelId/posts', protect, channelController.createChannelPost);

module.exports = router;
