const userService = require('../services/userService');

// @desc    Register a Project Manager
// @route   POST /api/users/project-manager
// @access  Private (Company Owner)
const createProjectManager = async (req, res) => {
    try {
        const user = await userService.createProjectManager(req.body, req.user.companyId);
        res.status(201).json(user);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get all users for the company
// @route   GET /api/users
// @access  Private (Company Owner, Project Manager)
const getUsers = async (req, res) => {
    try {
        const users = await userService.getAllUsers(req.user.companyId);
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    createProjectManager,
    getUsers,
};
