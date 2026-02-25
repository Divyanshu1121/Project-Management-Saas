const User = require('../models/User');

const createCompanyUser = async (req, res) => {
    const { name, email, password, role } = req.body;

    try {
        const allowedRoles = ['CTO', 'CFO', 'COO', 'PROJECT_MANAGER', 'HR'];
        if (!allowedRoles.includes(role)) {
            return res.status(400).json({ message: 'Invalid role' });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({
            name,
            email,
            password,
            role,
            companyId: req.user.companyId,
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                companyId: user.companyId,
                createdAt: user.createdAt
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getCompanyUsers = async (req, res) => {
    try {
        const companyId = req.user.companyId;
        const users = await User.find({
            companyId,
            role: {
                $ne: 'COMPANY_OWNER',
                $nin: ['EMPLOYEE']
            }
        })
            .select('-password')
            .sort({ createdAt: -1 });

        res.status(200).json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};


const deleteCompanyUser = async (req, res) => {
    try {
        const companyId = req.user.companyId;
        const userId = req.params.id;

        const user = await User.findOne({ _id: userId, companyId });

        if (!user) {
            return res.status(404).json({ message: 'User not found or not in your company' });
        }

        if (user.role === 'COMPANY_OWNER') {
            return res.status(400).json({ message: 'Cannot delete Company Owner' });
        }

        await User.findByIdAndDelete(userId);

        res.status(200).json({ message: 'User removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};


const createEmployee = async (req, res) => {
    const { name, email, password, teamId } = req.body;
    const Team = require('../models/Team');
    try {
        const companyId = req.user.companyId;

        if (!teamId) {
            return res.status(400).json({ message: 'Team selection is required' });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        const employeeCount = await User.countDocuments({
            companyId,
            role: 'EMPLOYEE'
        });

        const empId = `EMP-${String(employeeCount + 1).padStart(3, '0')}`;

        const user = await User.create({
            name,
            email,
            password,
            role: 'EMPLOYEE',
            companyId,
            teamId,
            empId
        });

        if (user) {
            const team = await Team.findById(teamId);
            if (team) {
                team.members.push(user._id);
                await team.save();
            }

            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                empId: user.empId,
                teamId: user.teamId,
                companyId: user.companyId,
                createdAt: user.createdAt
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const deleteEmployee = async (req, res) => {
    const Team = require('../models/Team');
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.role !== 'EMPLOYEE') {
            return res.status(400).json({ message: 'Can only delete employees via this endpoint' });
        }

        if (user.companyId.toString() !== req.user.companyId.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await Team.updateMany(
            { members: user._id },
            { $pull: { members: user._id } }
        );

        await user.deleteOne();
        res.json({ message: 'Employee deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getCompanyEmployees = async (req, res) => {
    const Task = require('../models/Task');
    const TimeLog = require('../models/TimeLog');
    try {
        const companyId = req.user.companyId;

        // Fetch basic employee data
        const employees = await User.find({
            companyId,
            role: { $in: ['EMPLOYEE', 'PROJECT_MANAGER'] }
        })
            .populate('teamId', 'name')
            .select('-password')
            .sort({ createdAt: -1 });

        // Augment with metrics
        const augmentedEmployees = await Promise.all(employees.map(async (emp) => {
            const activeTasksCount = await Task.countDocuments({
                assignedTo: emp._id,
                status: { $ne: 'APPROVED' }
            });

            // Get last activity (either from task update or time log)
            const [lastTask, lastLog] = await Promise.all([
                Task.findOne({ assignedTo: emp._id }).sort({ updatedAt: -1 }).select('updatedAt'),
                TimeLog.findOne({ userId: emp._id }).sort({ createdAt: -1 }).select('createdAt')
            ]);

            const lastActivity = [
                lastTask?.updatedAt,
                lastLog?.createdAt,
                emp.updatedAt // Fallback to user update
            ].filter(Boolean).sort((a, b) => b - a)[0];

            return {
                ...emp.toObject(),
                activeTasksCount,
                lastActivity
            };
        }));

        res.status(200).json(augmentedEmployees);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const updateEmployee = async (req, res) => {
    const { name, email, teamId, isActive, role } = req.body;
    const Team = require('../models/Team');
    const Task = require('../models/Task');

    try {
        const employee = await User.findOne({
            _id: req.params.id,
            companyId: req.user.companyId,
            role: { $in: ['EMPLOYEE', 'PROJECT_MANAGER'] } // Support both for HR
        });

        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        // Check for active tasks if deactivating
        let warning = null;
        if (isActive === false && employee.isActive !== false) {
            const activeTasksCount = await Task.countDocuments({
                assignedTo: employee._id,
                status: { $ne: 'APPROVED' }
            });
            if (activeTasksCount > 0) {
                warning = `This employee has ${activeTasksCount} active tasks. These should be reassigned.`;
            }
        }

        if (email && email !== employee.email) {
            const emailExists = await User.findOne({ email });
            if (emailExists) {
                return res.status(400).json({ message: 'Email already in use' });
            }
            employee.email = email;
        }

        if (name) employee.name = name;
        if (isActive !== undefined) employee.isActive = isActive;
        if (role && ['EMPLOYEE', 'PROJECT_MANAGER'].includes(role)) employee.role = role;

        if (teamId && teamId !== String(employee.teamId)) {
            // Remove from old team
            if (employee.teamId) {
                await Team.findByIdAndUpdate(employee.teamId, {
                    $pull: { members: employee._id }
                });
            }
            // Add to new team
            await Team.findByIdAndUpdate(teamId, {
                $addToSet: { members: employee._id }
            });
            employee.teamId = teamId;
        }

        await employee.save();

        const updated = await User.findById(employee._id)
            .populate('teamId', 'name')
            .select('-password');

        res.json({ ...updated.toObject(), warning });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    createCompanyUser,
    getCompanyUsers,
    deleteCompanyUser,
    createEmployee,
    deleteEmployee,
    getCompanyEmployees,
    updateEmployee
};
