const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true,
    },
    type: {
        type: String,
        enum: [
            'TASK_ASSIGNED',
            'TASK_UPDATED',
            'TASK_APPROVED',
            'TASK_REJECTED',
            'TASK_SUBMITTED',
            'TASK_DEADLINE',
            'SPRINT_STARTED',
            'SPRINT_COMPLETED',
            'MENTION',
            'PROJECT_CREATED',
            'PROJECT_COMPLETED',
            'LEAVE_REQUEST',
            'LEAVE_APPROVED',
            'LEAVE_REJECTED',
            'WFH_REQUEST',
            'WFH_APPROVED',
            'WFH_REJECTED',
            'ACTIVITY',
            'GENERAL',
        ],
        default: 'GENERAL',
    },
    title: {
        type: String,
        required: true,
        trim: true,
    },
    message: {
        type: String,
        required: true,
        trim: true,
    },
    isRead: {
        type: Boolean,
        default: false,
    },
    link: {
        type: String,
        default: null,
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
    },
}, { timestamps: true });

notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, isRead: 1 });

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;
