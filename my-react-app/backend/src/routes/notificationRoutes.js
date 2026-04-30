const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authenticateToken } = require('../middleware/auth');

// All notification routes require authentication
router.post('/notifications', authenticateToken, notificationController.createNotification);
router.get('/notifications', authenticateToken, notificationController.getAllNotifications);
router.get('/notifications/:id', authenticateToken, notificationController.getNotificationById);
router.patch('/notifications/:id/read', authenticateToken, notificationController.markAsRead);
router.patch('/notifications/user/:userId/read-all', authenticateToken, notificationController.markAllAsRead);
router.get('/notifications/user/:userId/unread-count', authenticateToken, notificationController.getUnreadCount);
router.delete('/notifications/:id', authenticateToken, notificationController.deleteNotification);

module.exports = router;
