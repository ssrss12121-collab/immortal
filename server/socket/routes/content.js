const express = require('express');
const router = express.Router();
const contentController = require('../controllers/contentController');

// Banners
router.get('/banners', contentController.getBanners);
router.post('/banners/add', contentController.addBanner);
router.delete('/banners/:id', contentController.deleteBanner);
router.post('/banners/update/:id', contentController.updateBanner);

// News
router.get('/news', contentController.getNews);
router.post('/news/add', contentController.addNews);
router.delete('/news/:id', contentController.deleteNews);
router.post('/news/update/:id', contentController.updateNews);

// MVPs
router.get('/mvps', contentController.getMVPs);
router.post('/mvps/add', contentController.addMVP);
router.delete('/mvps/:id', contentController.deleteMVP);
router.post('/mvps/update/:id', contentController.updateMVP);

module.exports = router;
