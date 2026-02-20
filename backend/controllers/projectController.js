const projectService = require('../services/projectService');

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

const getProjects = async (req, res) => {
    try {
        const projects = await projectService.getProjects(req.user.companyId);
        res.json(projects);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const updateProject = async (req, res) => {
    try {
        const project = await projectService.updateProject(
            req.params.id,
            req.user.companyId,
            req.body
        );
        res.json(project);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const deleteProject = async (req, res) => {
    try {
        const result = await projectService.deleteProject(req.params.id, req.user.companyId);
        res.json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    createProject,
    getProjects,
    updateProject,
    deleteProject,
};
