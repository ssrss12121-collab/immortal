const express = require('express');
const router = express.Router();
const contentController = require('../controllers/contentController');

console.log('✅ MVPs Routes Loaded');
router.get('/', contentController.getMVPs);
router.post('/add', contentController.addMVP);
router.delete('/:id', contentController.deleteMVP);
router.post('/update/:id', contentController.updateMVP);

module.exports = router;
