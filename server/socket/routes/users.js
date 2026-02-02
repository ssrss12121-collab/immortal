const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/', userController.getAllUsers);
router.get('/featured', userController.getFeaturedPlayers);
router.get('/:id', userController.getUserById);
router.post('/update/:id', userController.updateProfile);
router.post('/role', userController.updateUserRole);
router.post('/ban', userController.banUser);
console.log('[DEBUG] userController keys:', Object.keys(userController));
router.post('/balance', userController.updateBalance);
router.post('/admin-update', userController.adminUpdateUser);
router.post('/correct-stats', userController.correctStats);
router.delete('/match-history/:tournamentId', userController.deleteMatchHistory);

module.exports = router;
