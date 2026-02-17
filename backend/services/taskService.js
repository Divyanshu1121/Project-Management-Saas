const Task = require('../models/Task');
const Project = require('../models/Project');

const createTask = async (taskData, managerId) => {
    // Verify project belongs to manager's company (or manager has access)
    // For simplicity, assuming if they have projectId, they selected it from their list

    // Fetch project to get companyId
    const project = await Project.findById(taskData.projectId);
    if (!project) {
        throw new Error('Project not found');
    }

    const task = await Task.create({
        ...taskData,
        companyId: project.companyId,
        // assignedTo comes from body
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
