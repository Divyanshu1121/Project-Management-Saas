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
    return task.populate('projectId', 'name');
};

// Get tasks — if projectId provided, filter by it; otherwise get all for the company
const getTasks = async (projectId, companyId) => {
    const filter = companyId ? { companyId } : {};
    if (projectId) filter.projectId = projectId;
    return await Task.find(filter)
        .populate('assignedTo', 'name email')
        .populate('projectId', 'name')
        .sort({ createdAt: -1 });
};

const updateTask = async (taskId, updateData) => {
    const task = await Task.findByIdAndUpdate(
        taskId,
        { ...updateData },
        { new: true, runValidators: true }
    )
        .populate('assignedTo', 'name email')
        .populate('projectId', 'name');
    if (!task) throw new Error('Task not found');
    return task;
};

const deleteTask = async (taskId) => {
    const task = await Task.findByIdAndDelete(taskId);
    if (!task) throw new Error('Task not found');
    return task;
};

module.exports = {
    createTask,
    getTasks,
    updateTask,
    deleteTask,
};
