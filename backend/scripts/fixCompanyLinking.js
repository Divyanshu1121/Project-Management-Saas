const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Company = require('../models/Company');
const User = require('../models/User');
const connectDB = require('../config/db');

dotenv.config();

const fixLinking = async () => {
    try {
        await connectDB();

        let usersFixed = 0;
        let companiesFixed = 0;

        console.log('--- Fixing Users (Owners) Company Links ---');
        const owners = await User.find({ role: { $in: ['owner', 'COMPANY_OWNER'] } });

        for (const owner of owners) {
            const compId = owner.company || owner.companyId;
            if (compId) {
                const company = await Company.findById(compId);
                if (company) {
                    if (!owner.company || owner.company.toString() !== company._id.toString() ||
                        !owner.companyId || owner.companyId.toString() !== company._id.toString()) {
                        owner.company = company._id;
                        owner.companyId = company._id;
                        await owner.save();
                        usersFixed++;
                        console.log(`Fixed User [${owner.email}] -> Linked to Company [${company.companyName}]`);
                    }

                    if (!company.ownerId || company.ownerId.toString() !== owner._id.toString()) {
                        company.ownerId = owner._id;
                        await company.save();
                        companiesFixed++;
                        console.log(`Fixed Company [${company.companyName}] -> Set owner to [${owner.email}]`);
                    }
                }
            }
        }
        console.log('--- Fixing Companies Owner Links ---');
        const companies = await Company.find({ isDeleted: { $ne: true } });

        for (const company of companies) {
            if (company.ownerId) {
                const owner = await User.findById(company.ownerId);
                if (owner) {
                    if (!owner.company || owner.company.toString() !== company._id.toString() ||
                        !owner.companyId || owner.companyId.toString() !== company._id.toString()) {
                        owner.company = company._id;
                        owner.companyId = company._id;
                        await owner.save();
                        usersFixed++;
                        console.log(`Fixed User [${owner.email}] -> Linked to Company [${company.companyName}]`);
                    }
                }
            }
        }

        console.log(`\n✅ Completed! Fixed ${usersFixed} Users and ${companiesFixed} Companies.`);

        const superAdmins = await User.find({ role: { $in: ['superadmin', 'SUPER_ADMIN'] } });
        console.log(`\nVerified Super Admins: ${superAdmins.length}`);
        superAdmins.forEach(u => console.log(` - ${u.email}`));

        const finalOwners = await User.find({ role: { $in: ['owner', 'COMPANY_OWNER'] } });
        console.log(`\nVerified Company Owners: ${finalOwners.length}`);
        let validOwners = 0;
        for (let user of finalOwners) {
            const cId = user.company || user.companyId;
            const hasValidCompany = cId ? ((await Company.countDocuments({ _id: cId })) > 0) : false;
            if (hasValidCompany) validOwners++;
            console.log(` - ${user.email} (Linked to valid company: ${hasValidCompany})`);
        }
        console.log(`\nOwners correctly linked: ${validOwners} / ${finalOwners.length}`);

        process.exit();
    } catch (err) {
        console.error('Error fixing linking:', err);
        process.exit(1);
    }
};

fixLinking();




