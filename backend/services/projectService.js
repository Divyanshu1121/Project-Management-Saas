const Project = require('../models/Project');

const createProject = async (projectData, managerId, companyId) => {
    const project = await Project.create({
        ...projectData,
        createdBy: managerId,
        companyId: companyId,
    });
    return project;
};

const getProjects = async (companyId) => {
    // Only fetch projects for the user's company
    return await Project.find({ companyId })
        .populate('createdBy', 'name')
        .sort({ createdAt: -1 });
};

module.exports = {
    createProject,
    getProjects,
};
