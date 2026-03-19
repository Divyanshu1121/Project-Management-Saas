const mongoose = require('mongoose');
require('dotenv').config();

async function fixVerification() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const User = require('./models/User');
        const Company = require('./models/Company');

        const userResult = await User.updateMany({}, { $set: { isEmailVerified: true } });
        console.log(`Updated ${userResult.modifiedCount} users to verified status`);

        const companyResult = await Company.updateMany({}, { $set: { isEmailVerified: true } });
        console.log(`Updated ${companyResult.modifiedCount} companies to verified status`);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
fixVerification();
