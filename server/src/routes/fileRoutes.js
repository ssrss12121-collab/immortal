const express = require('express');
const router = express.Router();
const multer = require('multer');
const fileController = require('../controllers/fileController');

// Multer setup for memory storage (direct upload to R2)
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

// @route   POST /api/files/upload
// @desc    Upload a file to Cloudflare R2
// @access  Private (should be protected by auth middleware)
router.post('/upload', upload.single('file'), fileController.uploadFile);

module.exports = router;
