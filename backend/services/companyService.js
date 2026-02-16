const Company = require('../models/Company');
const User = require('../models/User');
const mongoose = require('mongoose');

const Project = require('../models/Project');
const Task = require('../models/Task');

const createCompany = async (companyData, ownerData) => {
    // Check if company exists
    const companyExists = await Company.findOne({ name: companyData.name });
    if (companyExists) {
        throw new Error('Company already exists');
    }

    // Check if owner exists (by email)
    const userExists = await User.findOne({ email: ownerData.email });
    if (userExists) {
        throw new Error('User (Owner) already exists');
    }

    // Generate IDs upfront
    const companyId = new mongoose.Types.ObjectId();
    const ownerId = new mongoose.Types.ObjectId();

    console.log(`Creating Company with ID: ${companyId}`);

    // Create Company
    const company = await Company.create({
        _id: companyId,
        name: companyData.name,
        ownerId: ownerId,
        isActive: true, // Default to true
        plan: companyData.plan || 'Free',
    });

    // Create Owner User
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
            companyId: companyId // Ensure this is returned for consistency
        }
    };
};

const getAllCompanies = async () => {
    return await Company.find({}).populate('ownerId', 'name email');
};

const updateCompany = async (id, updateData) => {
    console.log(`Service: Updating Company ID: ${id}`);
    const company = await Company.findByIdAndUpdate(id, updateData, { new: true });
    if (!company) {
        throw new Error('Company not found');
    }
    console.log(`Service: Company Updated: ${company.name}`);
    return company;
};

const deleteCompany = async (id) => {
    console.log(`Service: Deleting Company ID: ${id}`);

    // 1. Find the company first to ensure it exists
    const company = await Company.findById(id);
    if (!company) {
        throw new Error('Company not found');
    }

    // 2. Find associated Projects
    const projects = await Project.find({ companyId: id });
    const projectIds = projects.map(p => p._id);

    // 3. Delete Tasks associated with those Projects
    const taskDeleteResult = await Task.deleteMany({ projectId: { $in: projectIds } });
    console.log(`Service: Deleted ${taskDeleteResult.deletedCount} tasks.`);

    // 4. Delete Projects
    const projectDeleteResult = await Project.deleteMany({ companyId: id });
    console.log(`Service: Deleted ${projectDeleteResult.deletedCount} projects.`);

    // 5. Delete Users
    const userDeleteResult = await User.deleteMany({ companyId: id });
    console.log(`Service: Deleted ${userDeleteResult.deletedCount} users.`);

    // 6. Delete Company
    await Company.findByIdAndDelete(id);

    console.log(`Service: Company Deleted: ${id}`);
    return { message: 'Company and all associated data (Users, Projects, Tasks) deleted successfully', _id: id };
};

module.exports = {
    createCompany,
    getAllCompanies,
    updateCompany,
    deleteCompany,
};
