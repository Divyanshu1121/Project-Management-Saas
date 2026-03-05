const Message = require('../models/Message');
const MentionService = require('../services/mentionService');

// @desc    Get global chat messages for a company
// @route   GET /api/chat/global
const getGlobalMessages = async (req, res) => {
    try {
        const messages = await Message.find({
            companyId: req.user.companyId,
            isGlobal: true,
            $or: [
                { messageType: 'DEFAULT' },
                { sender: req.user._id },
                { recipient: req.user._id }
            ]
        })
            .populate('sender', 'name email')
            .populate('recipient', 'name email')
            .populate('mentions', 'name email')
            .sort({ createdAt: 1 })
            .limit(100); // Limit to last 100 messages for now

        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get project-specific chat messages
// @route   GET /api/chat/project/:projectId
const getProjectMessages = async (req, res) => {
    try {
        const { projectId } = req.params;

        const messages = await Message.find({
            projectId,
            companyId: req.user.companyId,
            isGlobal: false
        })
            .populate('sender', 'name email')
            .populate('mentions', 'name email')
            .sort({ createdAt: 1 })
            .limit(100);

        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const getMentionSuggestions = async (req, res) => {
    try {
        const { query } = req.query;
        const users = await MentionService.getSuggestions(query, req.user.companyId);
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const uploadFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // In a real production app, you'd upload to Cloudinary/S3 here.
        // For now, we'll serve from the local uploads folder.
        const fileUrl = `/uploads/chat/${req.file.filename}`;

        res.json({
            url: fileUrl,
            name: req.file.originalname,
            fileType: req.file.mimetype
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error during upload' });
    }
};

module.exports = {
    getGlobalMessages,
    getProjectMessages,
    getMentionSuggestions,
    uploadFile
};
