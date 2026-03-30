const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Company = require('../models/Company');
const User = require('../models/User');
const connectDB = require('../config/db');

dotenv.config();

const recreateAmazon = async () => {
    try {
        await connectDB();

        const existingCompany = await Company.findOne({ companyName: /amazon/i });
        if (existingCompany) {
            console.log('Amazon already exists. No need to recreate.');
            process.exit();
        }

        console.log('Recreating Amazon Company...');
        const companyObjectId = new mongoose.Types.ObjectId();
        const ownerObjectId = new mongoose.Types.ObjectId();
        const generatedCompanyId = 'COMP-2024-AMZ890';
        const company = new Company({
            _id: companyObjectId,
            companyId: generatedCompanyId,
            name: 'Amazon',
            companyName: 'Amazon',
            companySize: '500+',
            industry: 'Technology',
            website: 'https://amazon.com',
            country: 'USA',
            city: 'Seattle',
            ownerId: ownerObjectId,
            isActive: true,
            plan: 'pro',
            signupType: 'manual',
            isEmailVerified: true,
            isDeleted: false
        });

        const owner = new User({
            _id: ownerObjectId,
            userId: 'USR-2024-AMZ123',
            name: 'Jeff Bezos',
            email: 'jeff@amazon.com',
            password: 'password123',
            phone: '+1 555-0100',
            role: 'owner',
            roleTitle: ['CEO', 'Founder'],
            company: companyObjectId,
            companyId: companyObjectId,
            companyCode: generatedCompanyId,
            isActive: true,
            isEmailVerified: true
        });

        await company.save();
        await owner.save();

        console.log('Amazon company and owner recreated successfully.');
        process.exit();
    } catch (error) {
        console.error('Error recreating Amazon:', error);
        process.exit(1);
    }
};

recreateAmazon();
