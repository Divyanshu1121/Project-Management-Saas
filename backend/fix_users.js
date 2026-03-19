const mongoose = require('mongoose');
require('dotenv').config();

async function fixUsers() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const User = require('./models/User');
        const count = await User.countDocuments({ userId: null });
        console.log(`Found ${count} users with userId: null`);
        const result = await User.updateMany({ userId: null }, { $unset: { userId: 1 } });
        console.log(`Successfully unset userId for ${result.modifiedCount} users`);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
fixUsers();
