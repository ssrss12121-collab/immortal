const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { rateLimiters } = require('../middleware/rateLimiter');

// Apply strict rate limiting to auth endpoints (5 attempts per 15 minutes)
router.post('/register', rateLimiters.auth, authController.register);
router.post('/login', rateLimiters.auth, authController.login);
router.post('/guest-login', rateLimiters.auth, authController.guestLogin);

module.exports = router;
