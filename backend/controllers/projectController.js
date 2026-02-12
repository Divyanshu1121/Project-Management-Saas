const projectService = require('../services/projectService');

// @desc    Create a new project
// @route   POST /api/projects
// @access  Private (Company Owner, Project Manager)
const createProject = async (req, res) => {
    try {
        const project = await projectService.createProject(
            req.body,
            req.user._id,
            req.user.companyId
        );
        res.status(201).json(project);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get all projects for the company
// @route   GET /api/projects
// @access  Private (All authenticated users of the company)
const getProjects = async (req, res) => {
    try {
        const projects = await projectService.getProjects(req.user.companyId);
        res.json(projects);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    createProject,
    getProjects,
};
