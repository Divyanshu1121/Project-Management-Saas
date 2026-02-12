const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const connectDB = require('../config/db');

dotenv.config();

const seedSuperAdmin = async () => {
    try {
        await connectDB();

        const superAdminExists = await User.findOne({ role: 'SUPER_ADMIN' });

        if (superAdminExists) {
            console.log('Super Admin already exists');
            process.exit();
        }

        const superAdmin = await User.create({
            name: 'Super Admin',
            email: 'admin@platform.com',
            password: 'password123', // Will be hashed by pre-save hook
            role: 'SUPER_ADMIN',
        });

        console.log(`Super Admin created: ${superAdmin.email}`);
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

seedSuperAdmin();
