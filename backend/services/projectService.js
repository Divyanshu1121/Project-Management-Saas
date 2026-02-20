const Project = require('../models/Project');
const Task = require('../models/Task');

const createProject = async (projectData, managerId, companyId) => {
    const project = await Project.create({
        ...projectData,
        createdBy: managerId,
        companyId: companyId,
    });
    return project;
};

const getProjects = async (companyId) => {
    return await Project.find({ companyId })
        .populate('createdBy', 'name')
        .populate('teamAssigned', 'name')
        .sort({ createdAt: -1 });
};

const updateProject = async (projectId, companyId, data) => {
    const project = await Project.findOne({ _id: projectId, companyId });
    if (!project) {
        throw new Error('Project not found');
    }

    const allowedFields = ['name', 'description', 'status', 'startDate', 'deadline', 'teamAssigned'];
    allowedFields.forEach(field => {
        if (data[field] !== undefined) {
            project[field] = data[field];
        }
    });

    await project.save();
    return await Project.findById(projectId)
        .populate('createdBy', 'name')
        .populate('teamAssigned', 'name');
};

const deleteProject = async (projectId, companyId) => {
    const project = await Project.findOne({ _id: projectId, companyId });
    if (!project) {
        throw new Error('Project not found');
    }

    const taskDeleteResult = await Task.deleteMany({ projectId });
    console.log(`Service: Deleted ${taskDeleteResult.deletedCount} tasks for Project ID: ${projectId}`);

    await Project.findByIdAndDelete(projectId);
    console.log(`Service: Deleted Project ID: ${projectId}`);

    return { message: 'Project and associated tasks deleted', _id: projectId };
};

module.exports = {
    createProject,
    getProjects,
    updateProject,
    deleteProject,
};
