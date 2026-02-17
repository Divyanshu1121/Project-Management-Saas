const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');
const Company = require('../models/Company');

// @desc    Get Company Dashboard Stats
// @route   GET /api/company/dashboard
// @access  Private (Company Owner)
const getCompanyDashboard = async (req, res) => {
    try {
        const companyId = req.user.companyId;

        // 1. Company Details
        const company = await Company.findById(companyId).select('name _id plan status createdAt isActive');

        // 2. Stats
        const totalUsers = await User.countDocuments({ companyId });
        const totalProjectManagers = await User.countDocuments({ companyId, role: 'PROJECT_MANAGER' });
        const totalEmployees = await User.countDocuments({ companyId, role: 'EMPLOYEE' });
        const totalProjects = await Project.countDocuments({ companyId });

        // Count tasks using the new companyId field
        // Note: For existing tasks without companyId, this will return 0 unless migrated. 
        // We could fallback to the old method if count is 0, but for now we follow the requirement.
        const totalTasks = await Task.countDocuments({ companyId });

        res.status(200).json({
            company: {
                name: company.name,
                _id: company._id,
                plan: company.plan,
                status: company.isActive ? 'Active' : 'Inactive', // Derived status if not explicit field
                createdAt: company.createdAt
            },
            stats: {
                totalUsers, // keeping for backward cap if needed, though not explicitly asked in stats cards list
                totalProjectManagers,
                totalEmployees,
                totalProjects,
                totalTasks
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getCompanyDashboard,
};
