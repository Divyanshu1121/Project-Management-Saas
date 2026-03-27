const mongoose = require('mongoose');

const wfhRequestSchema = new mongoose.Schema({
    employee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
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
    workLocation: {
        type: String,
        enum: ['home', 'cafe', 'library', 'coworking', 'travelling', 'other'],
    },
    customLocation: {
        type: String,
        trim: true,
    },
    reason: {
        type: String,
        trim: true,
    },
    workPlan: {
        type: String,
        trim: true,
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'cancelled'],
        default: 'pending',
    },
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    reviewNote: {
        type: String,
        trim: true,
    },
    isInformOnly: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });

// Validation: startDate <= endDate, and customLocation required when location is 'other'
wfhRequestSchema.pre('save', function () {
    if (this.startDate > this.endDate) {
        throw new Error('Start date cannot be after end date');
    }
    if (this.workLocation === 'other' && !this.customLocation?.trim()) {
        throw new Error('Custom location is required when work location is "other"');
    }
});

const WFHRequest = mongoose.model('WFHRequest', wfhRequestSchema);
module.exports = WFHRequest;
