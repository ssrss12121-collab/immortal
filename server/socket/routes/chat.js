const express = require('express');
const router = express.Router();
console.log('✅ Chat Routes Loaded');
const chatController = require('../controllers/chatController');

router.get('/history/:teamId', chatController.getChatHistory);

module.exports = router;
