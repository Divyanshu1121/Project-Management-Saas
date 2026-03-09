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
    /**
     * Parses a raw message and returns a structured command object if applicable.
     * @param {string} content - Raw message text.
     * @param {string} companyId - Contextual company ID.
     * @returns {Promise<{ type: string, recipientId?: string, content: string, error?: string, taskData?: object }>}
     */
    parse: async (content, companyId) => {
        if (!content.startsWith('/')) {
            return { type: 'DEFAULT', content };
        }

        const parts = content.split(' ');
        const firstPart = parts[0].toLowerCase(); // e.g., "/assign" or "/username"

        // Handle /assign command
        if (firstPart === '/assign') {
            const assignRegex = /^\/assign\s+([^\s]+)\s+(.+?)(?:\s+by\s+(.+))?$/i;
            const match = content.match(assignRegex);

            if (!match) {
                return {
                    type: 'DEFAULT',
                    content,
                    error: 'Invalid format. Use: /assign @user task title [by Friday]'
                };
            }

            let assigneeName = match[1];
            if (assigneeName.startsWith('@')) assigneeName = assigneeName.substring(1);
            const taskTitle = match[2].trim();
            const deadlineStr = match[3] ? match[3].trim() : null;

            try {
                const assignee = await User.findOne({
                    name: { $regex: new RegExp(`^${assigneeName}$`, 'i') },
                    companyId
                });

                if (!assignee) {
                    return { type: 'DEFAULT', content, error: `User "${assigneeName}" not found.` };
                }

                let deadline = null;
                if (deadlineStr) {
                    deadline = parseSimpleDate(deadlineStr);
                }

                return {
                    type: 'TASK_CREATE',
                    content,
                    taskData: {
                        title: taskTitle,
                        assignedTo: assignee._id,
                        assigneeName: assignee.name,
                        deadline
                    }
                };
            } catch (error) {
                return { type: 'DEFAULT', content, error: 'Error validating assignee.' };
            }
        }

        // Existing Whisper Logic
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

/**
 * Helper to parse simple relative dates like "Friday", "Tomorrow", "Today"
 */
function parseSimpleDate(str) {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const now = new Date();
    const input = str.toLowerCase().replace('next ', '').trim();

    if (input === 'today') return new Date();
    if (input === 'tomorrow') {
        const d = new Date();
        d.setDate(d.getDate() + 1);
        return d;
    }

    const dayIndex = days.indexOf(input);
    if (dayIndex !== -1) {
        const d = new Date();
        const daysUntil = (dayIndex + 7 - d.getDay()) % 7 || 7;
        d.setDate(d.getDate() + daysUntil);
        return d;
    }

    const parsed = Date.parse(str);
    return !isNaN(parsed) ? new Date(parsed) : null;
}

module.exports = CommandService;
