const express = require('express');
const router = express.Router();
const contentController = require('../controllers/contentController');

// Banners
console.log('✅ Banners Routes Loaded');
router.get('/', contentController.getBanners);
router.post('/add', contentController.addBanner);
router.delete('/:id', contentController.deleteBanner);
router.post('/update/:id', contentController.updateBanner);

module.exports = router;
