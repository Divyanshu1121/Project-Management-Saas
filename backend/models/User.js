const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    userId: { // auto-generated unique readable ID e.g. USR-2024-XXXXX
        type: String,
        unique: true,
        sparse: true
    },
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
    },
    role: {
        type: String,
        enum: ['superadmin', 'owner', 'pm', 'hr', 'employee', 'SUPER_ADMIN', 'COMPANY_OWNER', 'CEO', 'PROJECT_MANAGER', 'EMPLOYEE', 'CTO', 'CFO', 'COO', 'HR'],
        default: 'owner',
    },
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
    },
    companyId: { // Keeping as ObjectId to not break existing backward-compatible population code, readable string is companyCode
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
    },
    companyCode: { // readable company ID for quick ref
        type: String,
    },
    empId: {
        type: String,
    },
    teamId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team',
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    isEmailVerified: {
        type: Boolean,
        default: false,
    },
    emailVerificationToken: {
        type: String,
    },
    emailVerificationExpires: {
        type: Date,
    },
    lastLogin: {
        type: Date,
    }
}, { timestamps: true });

userSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
