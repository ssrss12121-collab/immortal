const express = require('express');
const router = express.Router();
const archiveController = require('../controllers/archiveController');

console.log('✅ Archives Routes Loaded');
router.get('/', archiveController.getArchives);
router.post('/add', archiveController.addArchive);
router.delete('/:id', archiveController.deleteArchive);
router.post('/update/:id', archiveController.updateArchive);

module.exports = router;
