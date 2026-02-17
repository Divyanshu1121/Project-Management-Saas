const Team = require('../models/Team');
const User = require('../models/User');

// @desc    Create a new team
// @route   POST /api/company/teams
// @access  Private (Leadership only)
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

// @desc    Get all teams for the company
// @route   GET /api/company/teams
// @access  Private (Leadership only)
const getTeams = async (req, res) => {
    try {
        const companyId = req.user.companyId;

        const teams = await Team.find({ companyId })
            .populate('createdBy', 'name')
            .populate('members', 'name email role')
            .sort({ createdAt: -1 });

        res.json(teams);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Delete a team
// @route   DELETE /api/company/teams/:id
// @access  Private (Leadership only)
const deleteTeam = async (req, res) => {
    try {
        const team = await Team.findById(req.params.id);

        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }

        // Ensure the team belongs to the user's company
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

// @desc    Add member to team
// @route   POST /api/company/teams/:id/members
// @access  Private (Leadership only)
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

// @desc    Remove member from team
// @route   DELETE /api/company/teams/:id/members/:userId
// @access  Private (Leadership only)
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

module.exports = {
    createTeam,
    getTeams,
    deleteTeam,
    addMember,
    removeMember
};
