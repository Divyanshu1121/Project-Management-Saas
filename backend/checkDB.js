const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const connectDB = require('./config/db');

dotenv.config();

const checkUser = async () => {
    try {
        await connectDB();

        const users = await User.find({}, 'name email role').limit(10);

        console.log('--- Existing Users ---');
        users.forEach(u => {
            console.log(`Name: ${u.name}, Email: ${u.email}, Role: ${u.role}`);
        });
        console.log('----------------------');

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

checkUser();
