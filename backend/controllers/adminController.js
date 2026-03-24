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
                    'owner.email': 1,
                    'owner.roleTitle': 1,
                    'owner.empId': 1
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

// @desc    Get all platform users (grouped by company on frontend)
// @route   GET /api/admin/users
// @access  Private (Super Admin)
const getPlatformUsers = async (req, res) => {
    try {
        // Step 1: Get all valid (non-deleted) company IDs
        const validCompanies = await Company.find({ isDeleted: { $ne: true } }).select('_id');
        const validCompanyIds = validCompanies.map(c => c._id);

        // Step 2: Fetch only:
        //   (a) Super Admins (no company assigned — these are platform-level)
        //   (b) Users whose company OR companyId field points to a valid company
        const users = await User.find({
            $or: [
                { role: { $in: ['superadmin', 'SUPER_ADMIN'] } },
                { company: { $in: validCompanyIds } },
                { companyId: { $in: validCompanyIds } }
            ]
        })
            .select('-password')
            .populate('company', 'name companyName companyId _id')
            .populate('companyId', 'name companyName companyId _id')
            .sort({ createdAt: -1 });

        console.log(`[getPlatformUsers] Valid companies: ${validCompanyIds.length}, Returned users: ${users.length}`);
        users.forEach(u => {
            const compObj = u.company || u.companyId;
            const compName = (compObj && typeof compObj === 'object') ? (compObj.companyName || compObj.name) : 'N/A';
            console.log(`  User: ${u.name} | role: ${u.role} | company: ${compName}`);
        });

        res.json(users);
    } catch (error) {
        console.error('[getPlatformUsers] Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getCompaniesWithStats,
    getPlatformUsers
};
