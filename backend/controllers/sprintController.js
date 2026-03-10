const Sprint = require('../models/Sprint');
const Project = require('../models/Project');
const Task = require('../models/Task');
const { createNotification } = require('../services/notificationService');
const { logActivity } = require('../services/activityLogService');

// @desc    Create a sprint
// @route   POST /api/sprints
// @access  Private (Owner/Manager)
const createSprint = async (req, res) => {
    const { name, goal, projectId, startDate, endDate } = req.body;

    try {
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        const sprint = await Sprint.create({
            name,
            goal,
            projectId,
            startDate,
            endDate,
            status: 'planned'
        });

        logActivity({
            userId: req.user?._id || null,
            actionType: 'SPRINT_CREATED',
            entityType: 'sprint',
            entityId: sprint._id,
            projectId,
            companyId: project.companyId,
            message: `Sprint "${sprint.name}" was created`,
            metadata: { sprintId: sprint._id, goal },
        });

        res.status(201).json(sprint);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get all sprints for a project
// @route   GET /api/sprints/project/:projectId
const getSprints = async (req, res) => {
    try {
        const sprints = await Sprint.find({ projectId: req.params.projectId }).sort({ createdAt: -1 });
        res.json(sprints);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get active sprint for a project with tasks
// @route   GET /api/sprints/project/:projectId/active
const getActiveSprint = async (req, res) => {
    try {
        const activeSprint = await Sprint.findOne({
            projectId: req.params.projectId,
            status: 'active'
        });

        if (!activeSprint) {
            return res.status(200).json(null);
        }

        const tasks = await Task.find({ sprintId: activeSprint._id });
        res.json({ ...activeSprint._doc, tasks });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Start a sprint
// @route   PATCH /api/sprints/:id/start
const startSprint = async (req, res) => {
    try {
        const sprint = await Sprint.findById(req.params.id);
        if (!sprint) {
            return res.status(404).json({ message: 'Sprint not found' });
        }

        // Ensure no other sprint is active for this project
        const hasActive = await Sprint.findOne({
            projectId: sprint.projectId,
            status: 'active'
        });

        if (hasActive) {
            return res.status(400).json({ message: 'Another sprint is already active' });
        }

        sprint.status = 'active';
        await sprint.save();

        // Activity log
        try {
            const project = await Project.findById(sprint.projectId);
            logActivity({
                userId: req.user?._id || null,
                actionType: 'SPRINT_STARTED',
                entityType: 'sprint',
                entityId: sprint._id,
                projectId: sprint.projectId,
                companyId: project?.companyId,
                message: `Sprint "${sprint.name}" has been started`,
                metadata: { sprintId: sprint._id },
            });
        } catch (e) { console.error('[Sprint] Log error:', e.message); }

        // Notify all employees assigned to tasks in this sprint
        try {
            const project = await Project.findById(sprint.projectId);
            const sprintTasks = await Task.find({ sprintId: sprint._id, assignedTo: { $exists: true, $ne: null } }).select('assignedTo title');
            const uniqueAssignees = [...new Set(sprintTasks.map(t => t.assignedTo?.toString()).filter(Boolean))];
            await Promise.all(uniqueAssignees.map(uid =>
                createNotification({
                    recipientId: uid,
                    companyId: project?.companyId,
                    type: 'SPRINT_STARTED',
                    title: `Sprint started: ${sprint.name}`,
                    message: `Sprint "${sprint.name}" has started${sprint.goal ? ` — Goal: ${sprint.goal}` : ''}`,
                    link: '/manager/projects',
                    metadata: { sprintId: sprint._id },
                })
            ));
        } catch (e) { console.error('[Sprint] Notification error:', e.message); }

        res.json(sprint);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Complete a sprint (tasks remain but sprint is done)
// @route   PATCH /api/sprints/:id/complete
const completeSprint = async (req, res) => {
    try {
        const sprint = await Sprint.findById(req.params.id);
        if (!sprint) {
            return res.status(404).json({ message: 'Sprint not found' });
        }

        sprint.status = 'completed';
        await sprint.save();

        // Activity log
        try {
            const project = await Project.findById(sprint.projectId);
            logActivity({
                userId: req.user?._id || null,
                actionType: 'SPRINT_COMPLETED',
                entityType: 'sprint',
                entityId: sprint._id,
                projectId: sprint.projectId,
                companyId: project?.companyId,
                message: `Sprint "${sprint.name}" has been completed`,
                metadata: { sprintId: sprint._id },
            });
        } catch (e) { console.error('[Sprint] Log error:', e.message); }

        // Notify all employees assigned to tasks in this sprint
        try {
            const project = await Project.findById(sprint.projectId);
            const sprintTasks = await Task.find({ sprintId: sprint._id, assignedTo: { $exists: true, $ne: null } }).select('assignedTo');
            const uniqueAssignees = [...new Set(sprintTasks.map(t => t.assignedTo?.toString()).filter(Boolean))];
            await Promise.all(uniqueAssignees.map(uid =>
                createNotification({
                    recipientId: uid,
                    companyId: project?.companyId,
                    type: 'SPRINT_COMPLETED',
                    title: `Sprint completed: ${sprint.name}`,
                    message: `Sprint "${sprint.name}" has been marked as completed.`,
                    link: '/manager/projects',
                    metadata: { sprintId: sprint._id },
                })
            ));
        } catch (e) { console.error('[Sprint] Notification error:', e.message); }

        res.json(sprint);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Assign task to a sprint
// @route   PATCH /api/sprints/tasks/:taskId/assign
const assignTaskToSprint = async (req, res) => {
    const { sprintId } = req.body;
    try {
        const task = await Task.findById(req.params.taskId);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        task.sprintId = sprintId;
        await task.save();
        res.json(task);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Remove task from sprint
// @route   PATCH /api/sprints/tasks/:taskId/remove
const removeFromSprint = async (req, res) => {
    try {
        const task = await Task.findById(req.params.taskId);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        task.sprintId = undefined;
        await task.save();
        res.json(task);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    createSprint,
    getSprints,
    getActiveSprint,
    startSprint,
    completeSprint,
    assignTaskToSprint,
    removeFromSprint,
};
