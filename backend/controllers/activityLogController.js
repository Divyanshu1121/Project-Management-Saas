const ActivityLog = require('../models/ActivityLog');

const getProjectActivity = async (req, res) => {
    try {
        const { projectId } = req.params;
        const limit = Math.min(parseInt(req.query.limit) || 50, 200);
        const skip = parseInt(req.query.skip) || 0;
        const filter = { projectId, companyId: req.user.companyId };

        if (req.query.actionType) {
            filter.actionType = req.query.actionType;
        }

        const [logs, total] = await Promise.all([
            ActivityLog.find(filter)
                .populate('userId', 'name email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            ActivityLog.countDocuments(filter),
        ]);

        res.json({ logs, total, limit, skip });
    } catch (err) {
        console.error('[ActivityLog] getProjectActivity:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

const getTaskActivity = async (req, res) => {
    try {
        const { taskId } = req.params;
        const limit = Math.min(parseInt(req.query.limit) || 100, 500);

        const logs = await ActivityLog.find({
            entityId: taskId,
            entityType: 'task',
            companyId: req.user.companyId,
        })
            .populate('userId', 'name email')
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();

        res.json({ logs });
    } catch (err) {
        console.error('[ActivityLog] getTaskActivity:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

const getCompanyActivity = async (req, res) => {
    try {
        const limit = Math.min(parseInt(req.query.limit) || 30, 100);
        const logs = await ActivityLog.find({ companyId: req.user.companyId })
            .populate('userId', 'name email')
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();

        res.json({ logs });
    } catch (err) {
        console.error('[ActivityLog] getCompanyActivity:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { getProjectActivity, getTaskActivity, getCompanyActivity };
