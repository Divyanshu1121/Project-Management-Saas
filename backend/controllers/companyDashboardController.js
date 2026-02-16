const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');
const Company = require('../models/Company');

// @desc    Get Company Dashboard Stats
// @route   GET /api/company/dashboard
// @access  Private (Company Owner, Project Manager, Employee - maybe restricted?)
// Requirement: "All queries must filter using: req.user.companyId"
const getCompanyDashboard = async (req, res) => {
    try {
        const companyId = req.user.companyId;

        // 1. Company Details
        const company = await Company.findById(companyId).select('name _id ownerId createdAt isActive plan');

        // 2. Total Users in Company
        const totalUsers = await User.countDocuments({ companyId });

        // 3. Total Project Managers
        const totalProjectManagers = await User.countDocuments({ companyId, role: 'PROJECT_MANAGER' });

        // 4. Total Employees
        const totalEmployees = await User.countDocuments({ companyId, role: 'EMPLOYEE' });

        // 5. Total Projects
        const totalProjects = await Project.countDocuments({ companyId });

        // 6. Total Tasks (Tasks belong to projects which belong to company)
        // Since tasks are linked to projects, and projects are linked to company, we can:
        // Option A: Find all projects for company, then count tasks for those projects.
        // Option B: If Task schema had companyId directly (it doesn't in previous view), we'd use that.
        // Checking Task.js: It has projectId. Project.js has companyId.

        // We need to find all projects for this company first
        const projects = await Project.find({ companyId }).select('_id');
        const projectIds = projects.map(p => p._id);

        const totalTasks = await Task.countDocuments({ projectId: { $in: projectIds } });

        // 7. Tasks by Status
        // Since Task schema doesn't have companyId (it has projectId), we need to aggregate based on projectIds found in step 6.
        const tasksByStatus = await Task.aggregate([
            { $match: { projectId: { $in: projectIds } } },
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        res.status(200).json({
            company,
            stats: {
                totalUsers,
                totalProjectManagers,
                totalEmployees,
                totalProjects,
                totalTasks,
                tasksByStatus, // Include this for the chart
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
