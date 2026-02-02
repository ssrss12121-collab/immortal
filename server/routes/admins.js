const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const adminAuth = require('../middleware/adminAuth');
const { rateLimiters } = require('../middleware/rateLimiter');

// Public route - no auth required (but rate limited)
router.post('/login', rateLimiters.auth, adminController.login);

// Protected routes - require admin authentication
router.get('/stats', adminAuth, adminController.getStats);
router.get('/admins', adminAuth, adminController.getAllAdmins);
router.post('/create', adminAuth, rateLimiters.sensitive, adminController.createAdmin);

module.exports = router;
