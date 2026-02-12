const mongoose = require('mongoose');

const timeLogSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    taskId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task',
        required: true,
    },
    date: {
        type: Date,
        required: true,
        default: Date.now,
    },
    startTime: {
        type: Date,
    },
    endTime: {
        type: Date,
    },
    duration: {
        type: Number, // In minutes
        default: 0,
    },
    description: {
        type: String,
    },
}, { timestamps: true });

const TimeLog = mongoose.model('TimeLog', timeLogSchema);
module.exports = TimeLog;
