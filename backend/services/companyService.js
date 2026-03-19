const Company = require('../models/Company');
const User = require('../models/User');
const mongoose = require('mongoose');

const Project = require('../models/Project');
const Task = require('../models/Task');

const createCompany = async (companyData, ownerData) => {
    const companyExists = await Company.findOne({ name: companyData.name });
    if (companyExists) {
        throw new Error('Company already exists');
    }

    const userExists = await User.findOne({ email: ownerData.email });
    if (userExists) {
        throw new Error('User (Owner) already exists');
    }

    const companyId = new mongoose.Types.ObjectId();
    const ownerId = new mongoose.Types.ObjectId();


    const company = await Company.create({
        _id: companyId,
        name: companyData.name,
        ownerId: ownerId,
        isActive: true,
        plan: companyData.plan || 'Free',
    });

    const user = await User.create({
        _id: ownerId,
        name: ownerData.name,
        email: ownerData.email,
        password: ownerData.password || 'Temp@123',
        role: 'COMPANY_OWNER',
        companyId: companyId,
    });

    return {
        message: 'Company registered successfully',
        company,
        owner: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            companyId: companyId,
        }
    };
};

const getAllCompanies = async () => {
    return await Company.find({ isDeleted: { $ne: true } }).populate('ownerId', 'name email');
};

const updateCompany = async (id, updateData) => {
    const company = await Company.findByIdAndUpdate(id, updateData, { new: true });
    if (!company) {
        throw new Error('Company not found');
    }
    return company;
};

const deleteCompany = async (id) => {
    const company = await Company.findById(id);
    if (!company) {
        throw new Error('Company not found');
    }

    // Soft delete company
    company.isDeleted = true;
    company.deletedAt = new Date();
    company.isActive = false;
    await company.save();

    // Deactivate all users of this company
    await User.updateMany({ companyId: id }, { isActive: false });

    return { message: 'Company soft-deleted successfully', _id: id };
};

module.exports = {
    createCompany,
    getAllCompanies,
    updateCompany,
    deleteCompany,
};
