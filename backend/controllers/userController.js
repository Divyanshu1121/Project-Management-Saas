const userService = require('../services/userService');

const createProjectManager = async (req, res) => {
    try {
        const user = await userService.createProjectManager(req.body, req.user.companyId);
        res.status(201).json(user);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const getUsers = async (req, res) => {
    try {
        let companyId = req.user.companyId;

        if (req.user.role === 'SUPER_ADMIN') {
            return res.status(403).json({ message: 'Super admin must use dedicated admin endpoints' });
        }

        const users = await userService.getAllUsers(companyId);
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    createProjectManager,
    getUsers,
};
