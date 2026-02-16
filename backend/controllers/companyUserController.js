const User = require('../models/User');


// @desc    Create a Project Manager
// @route   POST /api/company/project-manager
// @access  Private (Company Owner)
const createProjectManager = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // Ensure only COMPANY_OWNER can create Project Manager
        // (Middleware should handle role check, but double check logic can be here if needed)
        // Assuming middleware passing `req.user` with role.

        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create user
        const user = await User.create({
            name,
            email,
            password, // Pre-save hook will hash this
            role: 'PROJECT_MANAGER',
            companyId: req.user.companyId,
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                companyId: user.companyId,
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    createProjectManager,
};
