const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    },
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: function () { return !this.isGlobal; }
    },
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    content: {
        type: String,
        required: true,
        trim: true
    },
    isGlobal: {
        type: Boolean,
        default: false
    },
    messageType: {
        type: String,
        enum: ['DEFAULT', 'PRIVATE', 'COMMAND'],
        default: 'DEFAULT'
    }
}, { timestamps: true });

// Indexing for faster retrieval
messageSchema.index({ projectId: 1, createdAt: 1 });
messageSchema.index({ isGlobal: 1, companyId: 1, createdAt: 1 });
messageSchema.index({ sender: 1, recipient: 1, companyId: 1 });
messageSchema.index({ recipient: 1, companyId: 1 });

const Message = mongoose.model('Message', messageSchema);
module.exports = Message;
