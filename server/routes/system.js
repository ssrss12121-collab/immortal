const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const archiveController = require('../controllers/archiveController');

const systemController = require('../controllers/systemController');

// Notifications
router.get('/notifications/:userId', notificationController.getNotifications);
router.post('/notifications/read/:id', notificationController.markAsRead);
router.delete('/notifications/:id', notificationController.deleteNotification);
router.post('/notifications/send', notificationController.sendNotification);
router.post('/notifications/broadcast', notificationController.broadcastNotification);

// Archives
router.get('/archives', archiveController.getArchives);
router.post('/archives/add', archiveController.addArchive);
router.post('/archives/update/:id', archiveController.updateArchive);
router.delete('/archives/:id', archiveController.deleteArchive);

// Global Settings
router.get('/settings/:key', systemController.getSettings);
router.post('/settings/update', systemController.updateSettings);

module.exports = router;
