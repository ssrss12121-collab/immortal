const express = require('express');
const router = express.Router();
const settingController = require('../controllers/settingController');

router.get('/', settingController.getSettings);
router.post('/update', settingController.updateSetting);

module.exports = router;
