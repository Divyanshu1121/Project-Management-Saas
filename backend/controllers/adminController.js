const Company = require('../models/Company');
const User = require('../models/User');
const Project = require('../models/Project');

// @desc    Get all companies with aggregated metrics
// @route   GET /api/admin/companies
// @access  Private (Super Admin)
const getCompaniesWithStats = async (req, res) => {
    try {
        const companies = await Company.aggregate([
            { $match: { isDeleted: { $ne: true } } },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: 'company',
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
                                cond: { $in: ['$$u.role', ['PROJECT_MANAGER', 'pm']] }
                            }
                        }
                    },
                    totalEmployees: {
                        $size: {
                            $filter: {
                                input: '$members',
                                as: 'u',
                                cond: { $in: ['$$u.role', ['EMPLOYEE', 'employee']] }
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
                    companyId: 1,
                    companyName: 1,
                    name: 1,
                    industry: 1,
                    companySize: 1,
                    country: 1,
                    city: 1,
                    plan: 1,
                    isTrialActive: 1,
                    trialEndsAt: 1,
                    isEmailVerified: 1,
                    isActive: 1,
                    signupType: 1,
                    createdAt: 1,
                    totalUsers: 1,
                    totalProjectManagers: 1,
                    totalEmployees: 1,
                    totalProjects: 1,
                    ownerId: 1,
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
        // Show all users for Super Admin with their details
        const users = await User.find({})
            .select('-password')
            .populate('company', 'name companyName companyId')
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
