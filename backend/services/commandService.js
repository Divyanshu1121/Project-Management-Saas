const User = require('../models/User');

/**
 * Command Service handles parsing of slash commands in chat.
 */
const CommandService = {
    /**
     * Parses a raw message and returns a structured command object if applicable.
     * @param {string} content - Raw message text.
     * @param {string} companyId - Contextual company ID.
     * @returns {Promise<{ type: string, recipientId?: string, content: string, error?: string }>}
     */
    parse: async (content, companyId) => {
        if (!content.startsWith('/')) {
            return { type: 'DEFAULT', content };
        }

        const parts = content.split(' ');
        const firstPart = parts[0]; // e.g., "/username"

        if (firstPart.length <= 1) return { type: 'DEFAULT', content };

        const targetUsername = firstPart.substring(1); // Remove "/"
        const messageContent = parts.slice(1).join(' ').trim();

        if (!messageContent) {
            return { type: 'DEFAULT', content, error: 'Private message cannot be empty.' };
        }

        try {
            // Validate user exists in the same company
            const recipient = await User.findOne({
                name: { $regex: new RegExp(`^${targetUsername}$`, 'i') },
                companyId
            });

            if (!recipient) {
                return {
                    type: 'DEFAULT',
                    content,
                    error: `User "${targetUsername}" not found in your workspace.`
                };
            }

            return {
                type: 'PRIVATE',
                recipientId: recipient._id,
                content: messageContent
            };
        } catch (error) {
            return { type: 'DEFAULT', content, error: 'Internal command processing error.' };
        }
    }
};

module.exports = CommandService;
