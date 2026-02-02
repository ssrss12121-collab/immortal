const express = require('express');
const router = express.Router();
console.log('✅ Chat Routes Loaded');
const chatController = require('../controllers/chatController');

const { protect } = require('../middleware/authMiddleware');

router.get('/history', protect, chatController.getChatHistory);
router.get('/conversations', protect, chatController.getRecentConversations);
router.post('/mark-read', protect, chatController.markMessagesAsRead);

module.exports = router;
