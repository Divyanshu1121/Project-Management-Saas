const ActivityLog = require('../models/ActivityLog');

/**
 * Record an activity log entry.
 *
 * This function is intentionally fire-and-forget: it catches its own errors
 * so a logging failure NEVER blocks or crashes the calling service.
 *
 * @param {Object} opts
 * @param {string|ObjectId|null} opts.userId       - Who triggered the action
 * @param {string}               opts.actionType   - One of the enum values in ActivityLog schema
 * @param {string}               opts.entityType   - 'task' | 'project' | 'sprint' | 'system'
 * @param {string|ObjectId|null} opts.entityId     - The _id of the entity
 * @param {string|ObjectId|null} opts.projectId    - Associated project (for filtering)
 * @param {string|ObjectId}      opts.companyId    - Required — company scope
 * @param {string}               opts.message      - Human-readable description
 * @param {Object}               [opts.metadata]   - Optional extra data (old/new values, etc.)
 * @returns {Promise<void>}
 */
const logActivity = async ({
    userId = null,
    actionType,
    entityType,
    entityId = null,
    projectId = null,
    companyId,
    message,
    metadata = {},
}) => {
    try {
        await ActivityLog.create({
            userId,
            actionType,
            entityType,
            entityId,
            projectId,
            companyId,
            message,
            metadata,
        });
    } catch (err) {
        console.error('[ActivityLog] Failed to write log:', err.message);
    }
};

module.exports = { logActivity };
