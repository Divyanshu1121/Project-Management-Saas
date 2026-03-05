const mongoose = require('mongoose');

const sprintSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    goal: {
        type: String,
        trim: true,
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
        enum: ['planned', 'active', 'completed'],
        default: 'planned',
    },
}, { timestamps: true });

const Sprint = mongoose.model('Sprint', sprintSchema);
module.exports = Sprint;
