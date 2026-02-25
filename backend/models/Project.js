const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    status: {
        type: String,
        enum: ['PLANNING', 'ACTIVE', 'COMPLETED', 'ON_HOLD'],
        default: 'PLANNING',
    },
    progress: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    completedAt: Date,
    completedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    startDate: {
        type: Date,
    },
    deadline: {
        type: Date,
    },
    teamAssigned: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team',
    }],
}, { timestamps: true });

const Project = mongoose.model('Project', projectSchema);
module.exports = Project;
