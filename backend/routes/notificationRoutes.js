const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, ctrl.getNotifications);
router.get('/unread-count', protect, ctrl.getUnreadCount);
router.patch('/read-all', protect, ctrl.markAllAsRead);
router.delete('/', protect, ctrl.clearAll);
router.patch('/:id/read', protect, ctrl.markAsRead);
router.delete('/:id', protect, ctrl.deleteNotification);

module.exports = router;
