const User = require('../models/User');

/**
 * Mention Service handles extraction and resolution of @mentions in messages.
 */
const MentionService = {
    /**
     * Extracts all @usernames from a message string.
     * @param {string} content - Raw message text.
     * @returns {string[]} - Array of unique usernames found.
     */
    extractUsernames: (content) => {
        if (!content) return [];
        // Matches @ followed by word characters, up to space or punctuation
        const mentions = content.match(/@(\w+)/g) || [];
        // Remove the '@' prefix and deduplicate
        return [...new Set(mentions.map(m => m.substring(1)))];
    },

    /**
     * Resolves usernames to ObjectIds within the context of a company.
     * @param {string[]} usernames - Array of usernames.
     * @param {string} companyId - Company ID.
     * @returns {Promise<string[]>} - Array of User ObjectIds.
     */
    resolveUserIds: async (usernames, companyId) => {
        if (!usernames || usernames.length === 0) return [];

        try {
            const users = await User.find({
                name: { $in: usernames.map(u => new RegExp(`^${u}$`, 'i')) },
                companyId
            }).select('_id');

            return users.map(u => u._id);
        } catch (error) {
            console.error('Error resolving mention IDs:', error);
            return [];
        }
    },

    /**
     * Suggest users based on a partial username (for autocomplete).
     * @param {string} query - Partial username.
     * @param {string} companyId - Company ID.
     * @returns {Promise<Array<{_id: string, name: string}>>}
     */
    getSuggestions: async (query, companyId) => {
        if (!query) return [];

        try {
            return await User.find({
                name: { $regex: new RegExp(`^${query}`, 'i') },
                companyId,
                role: { $ne: 'ADMIN' } // Usually don't mention platform admins
            })
                .select('_id name email')
                .limit(5);
        } catch (error) {
            console.error('Error fetching mention suggestions:', error);
            return [];
        }
    }
};

module.exports = MentionService;
