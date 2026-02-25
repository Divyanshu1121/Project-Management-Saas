const groqService = require('../services/groqService');

const generateTaskContent = async (req, res) => {
    try {
        const { title, projectName, type } = req.body;

        if (!title || !projectName || !type) {
            return res.status(400).json({ message: 'Title, project name, and type are required' });
        }

        if (!['description', 'project_description', 'definition', 'subtasks'].includes(type)) {
            return res.status(400).json({ message: 'Invalid type requested' });
        }

        const content = await groqService.generateContent(title, projectName, type);

        if (type === 'description' || type === 'project_description') {
            return res.json({ [type]: content });
        } else if (type === 'definition') {
            return res.json({ definitionOfDone: content });
        } else if (type === 'subtasks') {
            // Split by newlines or commas and clean up
            const subtaskTitles = content
                .split(/\n|,/)
                .map(s => s.trim())
                .filter(s => s.length > 0)
                .slice(0, 7); // Limit to 7 subtasks

            return res.json({ subtasks: subtaskTitles });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { generateTaskContent };
