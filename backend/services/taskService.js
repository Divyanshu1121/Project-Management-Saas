const Task = require('../models/Task');
const Project = require('../models/Project');

const createTask = async (taskData, managerId) => {
    const project = await Project.findById(taskData.projectId);
    if (!project) {
        throw new Error('Project not found');
    }

    const task = await Task.create({
        ...taskData,
        companyId: project.companyId,
    });
    return task;
};

const getTasks = async (projectId) => {
    return await Task.find({ projectId })
        .populate('assignedTo', 'name email')
        .sort({ createdAt: -1 });
};

module.exports = {
    createTask,
    getTasks,
};
