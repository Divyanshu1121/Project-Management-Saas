const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');
const TimeLog = require('../models/TimeLog');

// @desc    Get dashboard analytics
// @route   GET /api/analytics
// @access  Private
const getAnalytics = async (req, res) => {
    try {
        const companyId = req.user.companyId;

        // Basic counts
        const totalProjects = await Project.countDocuments({ companyId });
        const totalTasks = await Task.countDocuments({ companyId });
        const totalUsers = await User.countDocuments({ companyId });

        // Tasks by status
        const tasksByStatus = await Task.aggregate([
            { $match: { companyId: companyId } },
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        // Productivity (Time logged by user ? or just total)
        // Let's get total duration logged
        // This aggregation might need to filter manually if TimeLog doesn't have companyId.
        // But we can approximate or use lookups.
        // For now, let's skip complex aggregation on TimeLog to save time/complexity, 
        // or just count tasks completed.

        // If user is Platform Admin, show platform stats
        let platformStats = {};
        if (req.user.role === 'Platform Admin') {
            const allCompanies = await require('../models/Company').countDocuments();
            const allUsers = await User.countDocuments();
            platformStats = {
                totalCompanies: allCompanies,
                totalPlatformUsers: allUsers,
            };
        }

        res.json({
            totalProjects,
            totalTasks,
            totalUsers,
            tasksByStatus,
            platformStats,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getAnalytics,
};
