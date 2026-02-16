const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');
const TimeLog = require('../models/TimeLog');
const Company = require('../models/Company');


const getAnalytics = async (req, res) => {
    try {
        const companyId = req.user.companyId;

        const totalProjects = await Project.countDocuments({ companyId });
        const totalTasks = await Task.countDocuments({ companyId });
        const totalUsers = await User.countDocuments({ companyId });

        const tasksByStatus = await Task.aggregate([
            { $match: { companyId: companyId } },
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        let platformStats = {};
        if (req.user.role === 'Platform Admin' || req.user.role === 'SUPER_ADMIN') {
            const totalCompanies = await Company.countDocuments();
            const activeCompanies = await Company.countDocuments({ isActive: true });
            const pausedCompanies = await Company.countDocuments({ isActive: false });
            const totalPlatformUsers = await User.countDocuments();

            platformStats = {
                totalCompanies,
                totalPlatformUsers,
                activeCompanies,
                pausedCompanies
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
