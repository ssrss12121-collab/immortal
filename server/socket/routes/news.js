const express = require('express');
const router = express.Router();
const contentController = require('../controllers/contentController');

console.log('✅ News Routes Loaded');
router.get('/', contentController.getNews);
router.post('/add', contentController.addNews);
router.delete('/:id', contentController.deleteNews);
router.post('/update/:id', contentController.updateNews);

module.exports = router;
