const mongoose = require('mongoose');

const projectDocSchema = new mongoose.Schema({
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true,
        unique: true
    },
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true,
    },
    overview: { type: String, default: '' },
    requirements: { type: String, default: '' },
    plan: { type: String, default: '' },
    definitionOfDone: { type: String, default: '' },
    technicalSpecs: { type: String, default: '' },
    meetingNotes: { type: String, default: '' },
    risks: { type: String, default: '' },
    attachments: [{ url: String, name: String, section: String }],
    lastUpdatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }
}, { timestamps: true });

const ProjectDoc = mongoose.model('ProjectDoc', projectDocSchema);
module.exports = ProjectDoc;
