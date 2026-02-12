const taskService = require('../services/taskService');

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private (Project Manager)
const createTask = async (req, res) => {
    try {
        const task = await taskService.createTask(req.body, req.user._id);
        res.status(201).json(task);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get tasks for a project
// @route   GET /api/tasks?projectId=xyz
// @access  Private
const getTasks = async (req, res) => {
    const { projectId } = req.query;
    try {
        const tasks = await taskService.getTasks(projectId);
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    createTask,
    getTasks,
};
