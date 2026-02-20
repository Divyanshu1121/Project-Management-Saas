const Company = require('../models/Company');
const User = require('../models/User');
const Project = require('../models/Project');

// @desc    Get all companies with aggregated metrics
// @route   GET /api/admin/companies
// @access  Private (Super Admin)
const getCompaniesWithStats = async (req, res) => {
    try {
        const companies = await Company.aggregate([
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: 'companyId',
                    as: 'members'
                }
            },
            {
                $lookup: {
                    from: 'projects',
                    localField: '_id',
                    foreignField: 'companyId',
                    as: 'projects'
                }
            },
            {
                $addFields: {
                    totalUsers: { $size: '$members' },
                    totalProjectManagers: {
                        $size: {
                            $filter: {
                                input: '$members',
                                as: 'u',
                                cond: { $eq: ['$$u.role', 'PROJECT_MANAGER'] }
                            }
                        }
                    },
                    totalEmployees: {
                        $size: {
                            $filter: {
                                input: '$members',
                                as: 'u',
                                cond: { $eq: ['$$u.role', 'EMPLOYEE'] }
                            }
                        }
                    },
                    totalProjects: { $size: '$projects' }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'ownerId',
                    foreignField: '_id',
                    as: 'owner'
                }
            },
            { $unwind: { path: '$owner', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    name: 1,
                    plan: 1,
                    isActive: 1,
                    createdAt: 1,
                    totalUsers: 1,
                    totalProjectManagers: 1,
                    totalEmployees: 1,
                    totalProjects: 1,
                    'owner.name': 1,
                    'owner.email': 1
                }
            },
            { $sort: { createdAt: -1 } }
        ]);

        res.json(companies);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get only platform owners (Strict data isolation)
// @route   GET /api/admin/users
// @access  Private (Super Admin)
const getPlatformUsers = async (req, res) => {
    try {
        // Only show Company Owners and other Super Admins
        // This enforces data isolation by hiding project managers and employees from super admin.
        const users = await User.find({
            role: { $in: ['COMPANY_OWNER', 'CEO', 'CTO', 'CFO', 'COO', 'SUPER_ADMIN'] }
        })
            .select('-password')
            .populate('companyId', 'name')
            .sort({ createdAt: -1 });

        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getCompaniesWithStats,
    getPlatformUsers
};
