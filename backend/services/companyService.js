const Company = require('../models/Company');
const User = require('../models/User');
const mongoose = require('mongoose');
const crypto = require('crypto');

const Project = require('../models/Project');
const Task = require('../models/Task');
const Team = require('../models/Team');
const Sprint = require('../models/Sprint');

const createCompany = async (companyData, ownerData) => {
    // Bug 2 Fix: case-insensitive duplicate check on BOTH name fields, only against non-deleted companies
    const nameRegex = new RegExp(`^${companyData.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
    const companyExists = await Company.findOne({
        $or: [{ name: nameRegex }, { companyName: nameRegex }],
        isDeleted: { $ne: true }   // <-- ignore soft-deleted / orphan companies
    });
    if (companyExists) {
        console.log('[createCompany] Duplicate check matched:', {
            _id: companyExists._id,
            name: companyExists.name,
            companyName: companyExists.companyName,
            isDeleted: companyExists.isDeleted
        });
        throw new Error('Company already exists');
    }
    console.log('[createCompany] No duplicate found, proceeding...');

    // Fix 1 & 3: Better duplicate email check — only block if the user belongs to a valid company
    const userExists = await User.findOne({ email: ownerData.email })
        .populate('company', 'name companyName isDeleted')
        .populate('companyId', 'name companyName isDeleted');

    if (userExists) {
        // Resolve the user's current company
        const compObj = userExists.company || userExists.companyId;
        const compName = (compObj && typeof compObj === 'object') ? (compObj.companyName || compObj.name) : 'an unknown company';
        const isCompDeleted = (compObj && typeof compObj === 'object') ? compObj.isDeleted : true;

        const isSuperAdmin = userExists.role === 'superadmin' || userExists.role === 'SUPER_ADMIN';

        // Block creation if user belongs to an active company or is a super admin
        if (isSuperAdmin || !isCompDeleted) {
            const displayComp = isSuperAdmin ? 'System Admin' : `[${compName}]`;
            throw new Error(`This email is already registered under ${displayComp}. Use a different email.`);
        } else {
            // It's an orphan user from a deleted company -> Safe to overwrite by deleting the old one
            console.log(`[createCompany] Email ${ownerData.email} belongs to orphan user. Deleting old record to reuse email.`);
            await User.findByIdAndDelete(userExists._id);
        }
    }

    const companyObjectId = new mongoose.Types.ObjectId();
    const ownerObjectId = new mongoose.Types.ObjectId();

    const randomCompHex = crypto.randomBytes(3).toString('hex').toUpperCase();
    const randomUsrHex = crypto.randomBytes(3).toString('hex').toUpperCase();
    const companyIdStr = `COMP-${new Date().getFullYear()}-${randomCompHex}`;
    const userIdStr = `USR-${new Date().getFullYear()}-${randomUsrHex}`;

    // Determine trial settings
    const isTrialActive = companyData.isTrialActive === true || companyData.isTrialActive === 'true';
    const trialEndsAt = isTrialActive ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : undefined;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const company = await Company.create([{
            _id: companyObjectId,
            companyId: companyIdStr,
            name: companyData.name,
            companyName: companyData.name,
            companySize: companyData.companySize || '',
            industry: companyData.industry || '',
            website: companyData.website || '',
            country: companyData.country || '',
            city: companyData.city || '',
            ownerId: ownerObjectId,
            isActive: companyData.isActive !== false,
            plan: (companyData.plan || 'free').toLowerCase(),
            isTrialActive,
            trialEndsAt,
            signupType: 'manual',
            isEmailVerified: companyData.isEmailVerified !== false,
        }], { session });

        const user = await User.create([{
            _id: ownerObjectId,
            userId: userIdStr,
            name: ownerData.name,
            email: ownerData.email,
            password: ownerData.password || 'Temp@123',
            phone: ownerData.phone || '',
            role: 'owner',
            empId: Array.isArray(ownerData.ownerRole) ? ownerData.ownerRole[0] : (ownerData.ownerRole || 'CEO'),
            roleTitle: Array.isArray(ownerData.ownerRole) ? ownerData.ownerRole : (ownerData.ownerRole ? [ownerData.ownerRole] : []),
            company: companyObjectId,
            companyId: companyObjectId,
            companyCode: companyIdStr,
            isActive: companyData.isActive !== false,
            isEmailVerified: companyData.isEmailVerified !== false,
        }], { session });

        await session.commitTransaction();
        session.endSession();

        console.log(`[createCompany] Created company: ${companyIdStr}, owner: ${userIdStr}`);

        return {
            message: 'Company registered successfully',
            company: company[0],
            owner: {
                _id: user[0]._id,
                userId: user[0].userId,
                name: user[0].name,
                email: user[0].email,
                role: user[0].role,
                companyId: companyObjectId,
            }
        };
    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        throw err;
    }
};

const getAllCompanies = async () => {
    return await Company.find({ isDeleted: { $ne: true } }).populate('ownerId', 'name email');
};

const updateCompany = async (id, updateData) => {
    // If trial is being turned on, auto-set trialEndsAt
    if (updateData.isTrialActive === true && !updateData.trialEndsAt) {
        updateData.trialEndsAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    }
    // Normalize plan to lowercase
    if (updateData.plan) {
        updateData.plan = updateData.plan.toLowerCase();
    }

    const company = await Company.findByIdAndUpdate(id, updateData, { new: true });
    if (!company) {
        throw new Error('Company not found');
    }
    return company;
};

// Bug 1 Fix: Full cascade hard delete
const deleteCompany = async (id) => {
    console.log(`[deleteCompany] Starting cascade delete for company: ${id}`);

    const company = await Company.findById(id);
    if (!company) {
        console.log(`[deleteCompany] Company not found: ${id}`);
        throw new Error('Company not found');
    }
    console.log(`[deleteCompany] Found company: ${company.name} (${company.companyName})`);

    // 1. Delete all Tasks belonging to this company
    const taskResult = await Task.deleteMany({ companyId: id });
    console.log(`[deleteCompany] Deleted ${taskResult.deletedCount} tasks`);

    // 2. Delete all Sprints belonging to this company's projects
    const companyProjects = await Project.find({ companyId: id }).select('_id');
    const projectIds = companyProjects.map(p => p._id);
    if (projectIds.length > 0) {
        const sprintResult = await Sprint.deleteMany({ projectId: { $in: projectIds } });
        console.log(`[deleteCompany] Deleted ${sprintResult.deletedCount} sprints for ${projectIds.length} projects`);
    }

    // 3. Delete all Projects
    const projectResult = await Project.deleteMany({ companyId: id });
    console.log(`[deleteCompany] Deleted ${projectResult.deletedCount} projects`);

    // 4. Delete all Teams
    const teamResult = await Team.deleteMany({ companyId: id });
    console.log(`[deleteCompany] Deleted ${teamResult.deletedCount} teams`);

    // 5. Delete all Users belonging to this company
    const userResult = await User.deleteMany({
        $or: [{ companyId: id }, { company: id }]
    });
    console.log(`[deleteCompany] Deleted ${userResult.deletedCount} users`);

    // 6. Hard delete the Company document itself
    const deleteResult = await Company.findByIdAndDelete(id);
    console.log(`[deleteCompany] Company document deleted:`, deleteResult ? 'YES' : 'NO');

    // 7. Verify it's gone
    const check = await Company.findById(id);
    console.log(`[deleteCompany] Verification — Still exists?`, check ? 'YES (ERROR!)' : 'No — clean delete ✓');

    return { message: 'Company and all related data permanently deleted', _id: id };
};

module.exports = {
    createCompany,
    getAllCompanies,
    updateCompany,
    deleteCompany,
};
