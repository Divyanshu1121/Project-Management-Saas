const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
    },
    status: {
        type: String,
        enum: ['TODO', 'IN_PROGRESS', 'SUBMITTED', 'APPROVED', 'REJECTED'],
        default: 'TODO',
    },
    priority: {
        type: String,
        enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
        default: 'MEDIUM',
    },
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true,
    },
    sprintId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Sprint',
    },
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true,
    },
    teamId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team',
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    startDate: {
        type: Date,
    },
    deadline: {
        type: Date,
    },
    estimatedHours: {
        type: Number,
        default: 0,
    },
    definitionOfDone: {
        type: String,
        trim: true,
    },
    subtasks: [
        {
            title: { type: String, required: true },
            isCompleted: { type: Boolean, default: false },
        }
    ],
    dependencies: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Task'
        }
    ],
    progress: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
    },
    submission: {
        comment: String,
        attachmentUrl: String,
        submittedAt: Date,
    },
    statusHistory: [
        {
            status: String,
            changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            changedAt: { type: Date, default: Date.now },
            note: String,
        }
    ],
}, { timestamps: true });

// Virtuals
taskSchema.virtual('isOverdue').get(function () {
    return (
        this.deadline &&
        new Date() > new Date(this.deadline) &&
        this.status !== 'APPROVED'
    );
});

taskSchema.virtual('actualHours').get(function () {
    // This will be populated by the controller/service since we need a separate query to TimeLog
    return this._actualHours || 0;
});

taskSchema.virtual('dependentTasks').get(function () {
    return this._dependentTasks || [];
});

taskSchema.set('toJSON', { virtuals: true });
taskSchema.set('toObject', { virtuals: true });

const Task = mongoose.model('Task', taskSchema);
module.exports = Task;
