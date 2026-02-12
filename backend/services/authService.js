const User = require('../models/User');
const generateToken = require('../utils/generateToken');

const login = async (email, password) => {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        return {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            companyId: user.companyId,
            token: generateToken(user._id),
        };
    } else {
        throw new Error('Invalid email or password');
    }
};

const register = async (userData) => {
    const { name, email, password, role } = userData;

    const userExists = await User.findOne({ email });
    if (userExists) {
        throw new Error('User already exists');
    }

    const user = await User.create({
        name,
        email,
        password,
        role: role || 'EMPLOYEE',
    });

    return {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
    };
};

module.exports = {
    login,
    register,
};
