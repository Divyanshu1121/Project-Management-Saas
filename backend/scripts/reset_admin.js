const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const connectDB = require('../config/db');

dotenv.config();

const resetSuperAdmin = async () => {
    try {
        await connectDB();

        const superAdmin = await User.findOne({ role: 'SUPER_ADMIN' });

        if (superAdmin) {
            console.log(`Found Super Admin: ${superAdmin.email}`);
            superAdmin.password = 'password123';
            await superAdmin.save();
            console.log('Password reset to: password123');
        } else {
            console.log('Super Admin not found. Creating one...');
            await User.create({
                name: 'Super Admin',
                email: 'admin@platform.com',
                password: 'password123',
                role: 'SUPER_ADMIN',
            });
            console.log('Super Admin created with password: password123');
        }

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

resetSuperAdmin();
