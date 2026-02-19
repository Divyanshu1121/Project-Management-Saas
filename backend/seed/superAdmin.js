const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const connectDB = require('../config/db');

dotenv.config();

const seedSuperAdmin = async () => {
    try {
        await connectDB();

        const superAdminExists = await User.findOne({ role: 'SUPER_ADMIN' });

        if (superAdminExists) {
            console.log('Super Admin already exists');
            process.exit(0);
        }

        await User.create({
            name: 'Super Admin',
            email: 'admin@saas.com',
            password: 'Admin@123',
            role: 'SUPER_ADMIN',
        });

        console.log('Super Admin created successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding Super Admin:', error);
        process.exit(1);
    }
};

seedSuperAdmin();
