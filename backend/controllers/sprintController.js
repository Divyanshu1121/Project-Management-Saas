const Sprint = require('../models/Sprint');
const Project = require('../models/Project');

// @desc    Create a sprint
// @route   POST /api/sprints
// @access  Private (Owner/Manager)
const createSprint = async (req, res) => {
    const { name, projectId, startDate, endDate } = req.body;

    try {
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        if (project.companyId.toString() !== req.user.companyId.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const sprint = await Sprint.create({
            name,
            projectId,
            startDate,
            endDate,
        });

        res.status(201).json(sprint);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get sprints for a project
// @route   GET /api/sprints/:projectId
// @access  Private
const getSprints = async (req, res) => {
    try {
        const sprints = await Sprint.find({ projectId: req.params.projectId });
        res.json(sprints);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    createSprint,
    getSprints,
};
