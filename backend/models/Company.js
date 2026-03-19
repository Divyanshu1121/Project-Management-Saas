const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
    companyId: {
        type: String,
        unique: true,
        sparse: true
    },
    name: {
        type: String,
        required: true,
        unique: true,
    },
    companyName: {
        type: String,
    },
    companySize: {
        type: String,
    },
    industry: {
        type: String,
    },
    website: {
        type: String,
    },
    country: {
        type: String,
    },
    city: {
        type: String,
    },
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    plan: {
        type: String,
        enum: ['free', 'basic', 'pro', 'advanced', 'Free', 'Basic', 'Pro', 'Advanced'],
        default: 'free',
    },
    trialEndsAt: {
        type: Date,
    },
    isTrialActive: {
        type: Boolean,
    },
    signupType: {
        type: String,
        enum: ["self-serve", "manual"],
        default: "self-serve"
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
    deletedAt: {
        type: Date,
    }
}, { timestamps: true });

const Company = mongoose.model('Company', companySchema);
module.exports = Company;
