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
        enum: ['Planning', 'Active', 'Completed', 'On Hold'],
        default: 'Planning',
    },
    deadline: {
        type: Date,
    },
}, { timestamps: true });

const Project = mongoose.model('Project', projectSchema);
module.exports = Project;
