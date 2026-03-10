const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },

        actionType: {
            type: String,
            required: true,
            enum: [
                'TASK_CREATED',
                'TASK_UPDATED',
                'TASK_STATUS_CHANGED',
                'TASK_ASSIGNED',
                'TASK_UNASSIGNED',
                'TASK_DEADLINE_UPDATED',
                'TASK_APPROVED',
                'TASK_REJECTED',
                'TASK_SUBMITTED',
                'TASK_DELETED',
                'PROJECT_CREATED',
                'PROJECT_UPDATED',
                'PROJECT_COMPLETED',
                'PROJECT_DELETED',
                'SPRINT_CREATED',
                'SPRINT_STARTED',
                'SPRINT_COMPLETED',
                'SPRINT_TASK_ASSIGNED',
                'SPRINT_TASK_REMOVED',
                'GENERAL',
            ],
        },

        entityType: {
            type: String,
            enum: ['task', 'project', 'sprint', 'system'],
            required: true,
        },

        entityId: {
            type: mongoose.Schema.Types.ObjectId,
            default: null,
        },

        projectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Project',
            default: null,
        },

        companyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Company',
            required: true,
        },

        message: {
            type: String,
            required: true,
            trim: true,
        },

        metadata: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },
    },
    { timestamps: true }
);

activityLogSchema.index({ projectId: 1, createdAt: -1 });
activityLogSchema.index({ entityId: 1, entityType: 1, createdAt: -1 });
activityLogSchema.index({ companyId: 1, createdAt: -1 });

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);
module.exports = ActivityLog;
