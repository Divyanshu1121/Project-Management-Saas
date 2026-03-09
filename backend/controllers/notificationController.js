const Notification = require('../models/Notification');

// GET /api/notifications  — paginated, optional filter by isRead
const getNotifications = async (req, res) => {
    try {
        const { isRead, page = 1, limit = 30 } = req.query;
        const filter = { recipient: req.user._id };
        if (isRead === 'true') filter.isRead = true;
        if (isRead === 'false') filter.isRead = false;

        const [notifications, total, unreadCount] = await Promise.all([
            Notification.find(filter)
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(Number(limit)),
            Notification.countDocuments(filter),
            Notification.countDocuments({ recipient: req.user._id, isRead: false }),
        ]);

        res.json({ notifications, total, unreadCount });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// GET /api/notifications/unread-count
const getUnreadCount = async (req, res) => {
    try {
        const count = await Notification.countDocuments({ recipient: req.user._id, isRead: false });
        res.json({ count });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// PATCH /api/notifications/:id/read  — mark single as read
const markAsRead = async (req, res) => {
    try {
        const notif = await Notification.findOneAndUpdate(
            { _id: req.params.id, recipient: req.user._id },
            { isRead: true },
            { new: true }
        );
        if (!notif) return res.status(404).json({ message: 'Notification not found' });
        res.json(notif);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// PATCH /api/notifications/read-all  — mark all as read
const markAllAsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { recipient: req.user._id, isRead: false },
            { isRead: true }
        );
        res.json({ message: 'All notifications marked as read' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// DELETE /api/notifications/:id
const deleteNotification = async (req, res) => {
    try {
        await Notification.findOneAndDelete({ _id: req.params.id, recipient: req.user._id });
        res.json({ message: 'Notification deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// DELETE /api/notifications  — clear all
const clearAll = async (req, res) => {
    try {
        await Notification.deleteMany({ recipient: req.user._id });
        res.json({ message: 'All notifications cleared' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = { getNotifications, getUnreadCount, markAsRead, markAllAsRead, deleteNotification, clearAll };
