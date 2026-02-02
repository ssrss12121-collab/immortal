const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

router.post('/login', adminController.login);
router.get('/stats', adminController.getStats);
router.get('/admins', adminController.getAllAdmins);
router.post('/create', adminController.createAdmin);

module.exports = router;
