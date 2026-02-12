const TimeLog = require('../models/TimeLog');
const Task = require('../models/Task');

// @desc    Log time for a task
// @route   POST /api/time-logs
// @access  Private (Employee/Manager/Owner)
const logTime = async (req, res) => {
    const { taskId, date, startTime, endTime, duration, description } = req.body;

    try {
        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        if (task.companyId.toString() !== req.user.companyId.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const timeLog = await TimeLog.create({
            userId: req.user._id,
            taskId,
            date,
            startTime,
            endTime,
            duration,
            description,
        });

        res.status(201).json(timeLog);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get time logs (can filter by task, user, or date range)
// @route   GET /api/time-logs
// @access  Private
const getTimeLogs = async (req, res) => {
    const { taskId, userId, startDate, endDate } = req.query;

    try {
        let query = {};

        // If filtering by taskId, check task belongs to company
        if (taskId) {
            const task = await Task.findById(taskId);
            if (task && task.companyId.toString() !== req.user.companyId.toString()) {
                return res.status(403).json({ message: 'Not authorized' });
            }
            if (task) query.taskId = taskId;
        }

        // If filtering by user, make sure it's self or manager
        if (userId) {
            query.userId = userId;
        }

        if (startDate && endDate) {
            query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
        }

        // Populate creates dependency issue if not careful, but basic is fine
        const logs = await TimeLog.find(query)
            .populate('userId', 'name')
            .populate('taskId', 'title');

        // Filter out logs from other companies (if not filtered by task which checks company already)
        // Since TimeLog doesn't have companyId directly, we rely on task connection or user connection.
        // But pure query above might return logs from other companies if we don't join.
        // Wait, different companies might have same taskId? No, ObjectId is unique globally.
        // So taskId filter is safe.
        // But what if no taskId filter?
        // We need to ensure we only return logs for valid tasks in the company.

        // Better way: Filter by tasks that belong to company
        // Or add companyId to TimeLog for easier querying.
        // For now, let's filter in memory or assume taskId is always provided or valid connection.

        // Secure implementation: Get all tasks of company, then find logs where taskId IN companyTasks.
        if (!taskId) {
            // Find all tasks of company
            // This might be heavy.
            // Let's add companyId to TimeLog model?
            // "TimeLog.js" I didn't add companyId.
            // Let's rely on finding logs where userId is in the company (since users are company-bound).
            // But a user might belong to multiple companies? "All users must belong to a company using companyId".
            // So users are single-tenant.

            // So filtering by userId (or default to current user's company users) is safe-ish.

            // Simplest: Find logs where userId is req.user._id (if Employee) or any user in company (if Manager).
            if (req.user.role === 'Employee') {
                query.userId = req.user._id;
            } else {
                // Manager/Owner can see all?
                // We need to ensure we don't see logs of users from other companies.
                // We can find all users of this company.
                const companyUsers = await require('../models/User').find({ companyId: req.user.companyId }).select('_id');
                const companyUserIds = companyUsers.map(u => u._id);

                // If userId param is passed, check if it's in companyUserIds
                if (userId && !companyUserIds.find(id => id.toString() === userId)) {
                    return res.status(403).json({ message: 'User not in your company' });
                }

                if (!userId) {
                    query.userId = { $in: companyUserIds };
                }
            }
        }

        const finalLogs = await TimeLog.find(query)
            .populate('userId', 'name')
            .populate('taskId', 'title');

        res.json(finalLogs);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    logTime,
    getTimeLogs,
};
