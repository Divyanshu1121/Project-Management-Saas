const Team = require('../models/Team');
const User = require('../models/User');

const createTeam = async (req, res) => {
    try {
        const { name } = req.body;
        const companyId = req.user.companyId;

        if (!name) {
            return res.status(400).json({ message: 'Team name is required' });
        }

        const team = new Team({
            name,
            companyId,
            createdBy: req.user._id
        });

        await team.save();
        res.status(201).json(team);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getTeams = async (req, res) => {
    try {
        const companyId = req.user.companyId;

        const teams = await Team.find({ companyId })
            .populate('createdBy', 'name')
            .populate('members', 'name email role empId')
            .sort({ createdAt: -1 });

        res.json(teams);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const deleteTeam = async (req, res) => {
    try {
        const team = await Team.findById(req.params.id);

        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }

        if (team.companyId.toString() !== req.user.companyId.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this team' });
        }

        await team.deleteOne();
        res.json({ message: 'Team removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const addMember = async (req, res) => {
    try {
        const { userId } = req.body;
        const team = await Team.findById(req.params.id);

        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }

        if (team.companyId.toString() !== req.user.companyId.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        if (team.members.includes(userId)) {
            return res.status(400).json({ message: 'User already in team' });
        }

        team.members.push(userId);
        await team.save();

        const updatedTeam = await Team.findById(req.params.id)
            .populate('createdBy', 'name')
            .populate('members', 'name email role empId');

        res.json(updatedTeam);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const removeMember = async (req, res) => {
    try {
        const team = await Team.findById(req.params.id);

        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }

        if (team.companyId.toString() !== req.user.companyId.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        team.members = team.members.filter(memberId => memberId.toString() !== req.params.userId);
        await team.save();

        const updatedTeam = await Team.findById(req.params.id)
            .populate('createdBy', 'name')
            .populate('members', 'name email role empId');

        res.json(updatedTeam);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const updateEmployee = async (req, res) => {
    try {
        const { name, email, teamId } = req.body;
        const companyId = req.user.companyId;

        // Find the employee and ensure they belong to the same company
        const employee = await User.findOne({ _id: req.params.id, companyId, role: 'EMPLOYEE' });
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found in your company' });
        }

        // Update allowed fields only
        if (name) employee.name = name;
        if (email) employee.email = email;
        await employee.save();

        // Handle team transfer if a new teamId is provided
        if (teamId && teamId !== '') {
            const newTeam = await Team.findOne({ _id: teamId, companyId });
            if (!newTeam) {
                return res.status(404).json({ message: 'Target team not found in your company' });
            }

            // Remove from all current teams in this company
            await Team.updateMany(
                { companyId, members: employee._id },
                { $pull: { members: employee._id } }
            );

            // Add to new team if not already a member
            if (!newTeam.members.includes(employee._id)) {
                newTeam.members.push(employee._id);
                await newTeam.save();
            }
        }

        res.json({
            _id: employee._id,
            name: employee.name,
            email: employee.email,
            empId: employee.empId,
            role: employee.role,
            companyId: employee.companyId,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const updateTeam = async (req, res) => {
    try {
        const { name, description } = req.body;
        const companyId = req.user.companyId;

        const team = await Team.findOne({ _id: req.params.id, companyId });
        if (!team) {
            return res.status(404).json({ message: 'Team not found in your company' });
        }

        if (name && name.trim()) team.name = name.trim();
        if (description !== undefined) team.description = description;

        await team.save();

        const updated = await Team.findById(team._id)
            .populate('createdBy', 'name')
            .populate('members', 'name email role empId');

        res.json(updated);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    createTeam,
    getTeams,
    deleteTeam,
    addMember,
    removeMember,
    updateEmployee,
    updateTeam
};
