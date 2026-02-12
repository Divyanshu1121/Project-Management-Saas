const Company = require('../models/Company');
const User = require('../models/User');

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

    // Create Owner User
    const user = await User.create({
        name: ownerData.name,
        email: ownerData.email,
        password: ownerData.password,
        role: 'COMPANY_OWNER',
    });

    // Create Company
    const company = await Company.create({
        name: companyData.name,
        ownerId: user._id,
        isActive: true, // Default to true
        plan: companyData.plan || 'Free',
    });

    // Link Company to Owner
    user.companyId = company._id;
    await user.save();

    return {
        company,
        owner: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        }
    };
};

const getAllCompanies = async () => {
    return await Company.find({}).populate('ownerId', 'name email');
};

const updateCompany = async (id, updateData) => {
    const company = await Company.findByIdAndUpdate(id, updateData, { new: true });
    return company;
};

const deleteCompany = async (id) => {
    await Company.findByIdAndDelete(id);
    // Optional: Delete associated users/projects/tasks if needed, 
    // but for now we just delete the company record.
    return { message: 'Company deleted' };
};

module.exports = {
    createCompany,
    getAllCompanies,
    updateCompany,
    deleteCompany,
};
