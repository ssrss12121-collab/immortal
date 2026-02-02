const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

router.get('/:userId', notificationController.getNotifications);
router.get('/invites/:userId', notificationController.getInvites);
router.delete('/:id', notificationController.deleteNotification);
router.put('/:id/read', notificationController.markAsRead);
router.post('/send', notificationController.sendNotification);
router.post('/broadcast', notificationController.broadcastNotification);

module.exports = router;
