const Notification = require('../models/Notification');

/**
 * Create a notification and return it.
 * @param {Object} opts - { recipientId, companyId, type, title, message, link, metadata }
 */
const createNotification = async ({ recipientId, companyId, type, title, message, link = null, metadata = {} }) => {
    try {
        const notif = await Notification.create({
            recipient: recipientId,
            companyId,
            type,
            title,
            message,
            link,
            metadata,
        });
        return notif;
    } catch (err) {
        console.error('[NotificationService] Error creating notification:', err.message);
        return null;
    }
};

/**
 * Emit notification via socket and persist it.
 * @param {Object} io - Socket.io server instance
 * @param {Map} userSockets - userId -> socketId map
 * @param {Object} opts - notification options
 */
const sendNotification = async (io, userSockets, { recipientId, companyId, type, title, message, link, metadata }) => {
    const notif = await createNotification({ recipientId, companyId, type, title, message, link, metadata });
    if (notif && io) {
        const socketId = userSockets.get(recipientId.toString());
        if (socketId) {
            io.to(socketId).emit('new_notification', notif);
        }
    }
    return notif;
};

module.exports = { createNotification, sendNotification };
