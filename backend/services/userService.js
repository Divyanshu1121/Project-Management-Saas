const User = require('../models/User');
const generateToken = require('../utils/generateToken');

const createProjectManager = async (userData, companyId) => {
    const { name, email, password } = userData;

    // Check availability
    const userExists = await User.findOne({ email });
    if (userExists) {
        throw new Error('User already exists');
    }

    const user = await User.create({
        name,
        email,
        password,
        role: 'PROJECT_MANAGER',
        companyId,
    });

    return {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyId: user.companyId,
    };
};

const getAllUsers = async (companyId) => {
    return await User.find({ companyId }).select('-password');
};

module.exports = {
    createProjectManager,
    getAllUsers,
};
