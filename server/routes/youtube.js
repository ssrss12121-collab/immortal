const express = require('express');
const router = express.Router();
const youtubeController = require('../controllers/youtubeController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.get('/active', youtubeController.getActiveContent);
router.get('/:id', youtubeController.getContentById);

// Admin routes (protected)
router.post('/', protect, youtubeController.createContent);
router.put('/:id', protect, youtubeController.updateContent);
router.delete('/:id', protect, youtubeController.deleteContent);
router.get('/admin/all', protect, youtubeController.getAllContent);

module.exports = router;
