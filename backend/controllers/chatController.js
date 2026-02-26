const Message = require('../models/Message');

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
            .sort({ createdAt: 1 })
            .limit(100);

        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getGlobalMessages,
    getProjectMessages
};
