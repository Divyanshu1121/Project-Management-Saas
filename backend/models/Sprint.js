const mongoose = require('mongoose');

const sprintSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true,
    },
    startDate: {
        type: Date,
        required: true,
    },
    endDate: {
        type: Date,
        required: true,
    },
    status: {
        type: String,
        enum: ['Planned', 'Active', 'Completed'],
        default: 'Planned',
    },
}, { timestamps: true });

const Sprint = mongoose.model('Sprint', sprintSchema);
module.exports = Sprint;
