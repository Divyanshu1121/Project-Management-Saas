const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
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
        enum: ['Free', 'Basic', 'Pro', 'Advanced'],
        default: 'Free',
    },
}, { timestamps: true });

const Company = mongoose.model('Company', companySchema);
module.exports = Company;
