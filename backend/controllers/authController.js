const authService = require('../services/authService');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    try {
        const user = await authService.register(req.body);
        res.status(201).json(user);
    } catch (error) {
        if (error.message === 'User already exists') {
            return res.status(400).json({ message: error.message });
        }
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await authService.login(email, password);
        res.json(user);
    } catch (error) {
        if (error.message === 'Invalid email or password') {
            return res.status(401).json({ message: error.message });
        }
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get user data
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
    const user = {
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        companyId: req.user.companyId,
    };
    res.status(200).json(user);
};

module.exports = {
    registerUser,
    loginUser,
    getMe,
};
