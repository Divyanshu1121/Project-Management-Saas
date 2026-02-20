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

// @desc    Get tasks (optionally filtered by projectId)
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res) => {
    const { projectId } = req.query;
    try {
        const tasks = await taskService.getTasks(projectId, req.user.companyId);
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update a task
// @route   PUT /api/tasks/:id
// @access  Private (Project Manager)
const updateTask = async (req, res) => {
    try {
        const task = await taskService.updateTask(req.params.id, req.body);
        res.json(task);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private (Project Manager)
const deleteTask = async (req, res) => {
    try {
        await taskService.deleteTask(req.params.id);
        res.json({ message: 'Task deleted successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    createTask,
    getTasks,
    updateTask,
    deleteTask,
};
