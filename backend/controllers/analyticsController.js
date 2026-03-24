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
        const role = req.user.role;
        const isSuperAdmin = role === 'SUPER_ADMIN' || role === 'superadmin' || role === 'Platform Admin';

        if (isSuperAdmin) {
            // Fix 1: Only count non-deleted companies for all stats
            const validCompanyFilter = { isDeleted: { $ne: true } };

            const totalCompanies = await Company.countDocuments(validCompanyFilter);
            const activeCompanies = await Company.countDocuments({ ...validCompanyFilter, isActive: true });
            const pausedCompanies = await Company.countDocuments({ ...validCompanyFilter, isActive: false });

            // Fix 1: Only count users that belong to a valid (non-deleted) company
            const validCompanies = await Company.find(validCompanyFilter).select('_id');
            const validCompanyIds = validCompanies.map(c => c._id);

            const totalPlatformUsers = await User.countDocuments({
                $or: [
                    { company: { $in: validCompanyIds } },
                    { companyId: { $in: validCompanyIds } }
                ]
            });

            platformStats = {
                totalCompanies,
                totalPlatformUsers,
                activeCompanies,
                pausedCompanies
            };

            console.log('[analytics] Platform stats:', platformStats);
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
