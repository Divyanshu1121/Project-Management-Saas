const Project = require('../models/Project');
const Task = require('../models/Task');
const TimeLog = require('../models/TimeLog');
const User = require('../models/User');
const workflow = require('./taskWorkflowService');
const dependencyService = require('./dependencyService');

// Strip empty-string values for ObjectId fields to prevent BSON cast errors
const sanitizeObjectIdFields = (data, fields) => {
    const cleaned = { ...data };
    for (const field of fields) {
        if (cleaned[field] === '' || cleaned[field] === null || cleaned[field] === undefined) {
            delete cleaned[field];
        }
    }
    return cleaned;
};


// ── PROJECTS ─────────────────────────────────────────────────────

const getProjects = async (companyId) => {
    return await Project.find({ companyId })
        .populate('createdBy', 'name')
        .populate('teamAssigned', 'name')
        .sort({ createdAt: -1 });
};

const createProject = async (data, managerId, companyId) => {
    const project = await Project.create({
        ...data,
        createdBy: managerId,
        companyId,
    });
    return project.populate(['createdBy', 'teamAssigned']);
};

const updateProject = async (projectId, companyId, data) => {
    const project = await Project.findOneAndUpdate(
        { _id: projectId, companyId },
        data,
        { returnDocument: 'after', runValidators: true }
    )
        .populate('createdBy', 'name')
        .populate('teamAssigned', 'name');
    if (!project) throw new Error('Project not found');
    return project;
};

const deleteProject = async (projectId, companyId) => {
    const project = await Project.findOneAndDelete({ _id: projectId, companyId });
    if (!project) throw new Error('Project not found');
    // Also delete all tasks belonging to this project
    await Task.deleteMany({ projectId, companyId });
    return project;
};

const updateProjectProgress = async (projectId) => {
    const totalTasks = await Task.countDocuments({ projectId });
    if (totalTasks === 0) {
        await Project.findByIdAndUpdate(projectId, { progress: 0 });
        return 0;
    }

    const approvedTasks = await Task.countDocuments({ projectId, status: 'APPROVED' });
    const progress = Math.round((approvedTasks / totalTasks) * 100);

    await Project.findByIdAndUpdate(projectId, { progress });
    return progress;
};

const completeProject = async (projectId, companyId, managerId) => {
    const project = await Project.findOne({ _id: projectId, companyId });
    if (!project) throw new Error('Project not found');

    if (project.status === 'COMPLETED') throw new Error('Project is already completed');

    // Check for pending tasks
    const pendingCount = await Task.countDocuments({
        projectId,
        status: { $ne: 'APPROVED' }
    });

    if (pendingCount > 0) {
        throw new Error(`Cannot complete project. There are ${pendingCount} pending tasks that must be approved.`);
    }

    project.status = 'COMPLETED';
    project.completedAt = new Date();
    project.completedBy = managerId;
    project.progress = 100;

    await project.save();
    return project;
};

// ── TASKS ─────────────────────────────────────────────────────────

const getTasks = async (companyId, filters = {}) => {
    const query = { companyId };

    if (filters.projectId) query.projectId = filters.projectId;
    if (filters.teamId) query.teamId = filters.teamId;
    if (filters.status) query.status = filters.status;
    if (filters.priority) query.priority = filters.priority;

    // Overdue: deadline < now AND status != APPROVED
    if (filters.overdue === 'true') {
        query.deadline = { $lt: new Date() };
        query.status = { $ne: 'APPROVED' };
    }

    const tasks = await Task.find(query)
        .populate('assignedTo', 'name email empId')
        .populate('projectId', 'name')
        .populate('teamId', 'name')
        .populate('dependencies', 'status')
        .sort({ createdAt: -1 });

    // Calculate actualHours and fetch dependentTasks for each task
    const tasksWithExtras = await Promise.all(tasks.map(async (task) => {
        const [logs, dependentTasks] = await Promise.all([
            TimeLog.find({ taskId: task._id }),
            Task.find({ dependencies: task._id }).select('title status')
        ]);
        const totalMinutes = logs.reduce((s, l) => s + (l.duration || 0), 0);
        task._actualHours = +(totalMinutes / 60).toFixed(2);
        task._dependentTasks = dependentTasks;
        return task;
    }));

    return tasksWithExtras;
};

const createTask = async (data, managerId, companyId) => {
    // Strip empty-string ObjectId fields to avoid BSON cast errors
    const clean = sanitizeObjectIdFields(data, ['assignedTo', 'teamId', 'sprintId']);

    // Validate project belongs to same company
    const project = await Project.findOne({ _id: clean.projectId, companyId });
    if (!project) throw new Error('Project not found or does not belong to your company');

    // Validate assignee belongs to same company (if provided)
    if (clean.assignedTo) {
        const employee = await User.findOne({ _id: clean.assignedTo, companyId });
        if (!employee) throw new Error('Assigned employee does not belong to your company');
    }

    // Auto-calculate progress if subtasks provided
    if (clean.subtasks) {
        clean.progress = workflow.calculateProgress(clean.subtasks);
    }

    const task = new Task({
        ...clean,
        companyId,
    });

    // Initial status history
    workflow.addStatusHistory(task, managerId, 'Task created');

    await task.save();

    // Update project progress
    await updateProjectProgress(clean.projectId);

    return await Task.findById(task._id)
        .populate('assignedTo', 'name email empId')
        .populate('projectId', 'name')
        .populate('teamId', 'name');
};

const updateTask = async (taskId, companyId, data, userId) => {
    // Strip empty-string ObjectId fields to avoid BSON cast errors
    const clean = sanitizeObjectIdFields(data, ['assignedTo', 'teamId', 'sprintId']);

    const task = await Task.findOne({ _id: taskId, companyId });
    if (!task) throw new Error('Task not found');

    const oldStatus = task.status;

    // If subtasks are updated, recalculate progress
    if (clean.subtasks) {
        clean.progress = workflow.calculateProgress(clean.subtasks);
    }

    // Apply updates
    Object.assign(task, clean);

    // If status changed, update history
    if (clean.status && clean.status !== oldStatus) {
        if (['IN_PROGRESS', 'SUBMITTED', 'APPROVED'].includes(clean.status)) {
            const isReady = await dependencyService.checkDependenciesCompleted(taskId);
            if (!isReady) throw new Error(`Cannot update status to ${clean.status}: dependent tasks must be APPROVED first.`);
        }
        workflow.addStatusHistory(task, userId, clean.statusNote || 'Status updated by manager');
    }

    await task.save();

    // Update project progress
    await updateProjectProgress(task.projectId);

    return await Task.findById(task._id)
        .populate('assignedTo', 'name email empId')
        .populate('projectId', 'name')
        .populate('teamId', 'name');
};

const approveTask = async (taskId, companyId, managerId) => {
    const task = await Task.findOne({ _id: taskId, companyId });
    if (!task) throw new Error('Task not found');
    if (task.status !== 'SUBMITTED') throw new Error('Task must be in SUBMITTED status to approve');

    const isReady = await dependencyService.checkDependenciesCompleted(taskId);
    if (!isReady) throw new Error('Cannot approve task: dependent tasks must be APPROVED first.');

    task.status = 'APPROVED';
    workflow.addStatusHistory(task, managerId, 'Task approved by manager');
    await task.save();

    // Update project progress
    await updateProjectProgress(task.projectId);

    return task;
};

const rejectTask = async (taskId, companyId, managerId, note) => {
    const task = await Task.findOne({ _id: taskId, companyId });
    if (!task) throw new Error('Task not found');
    if (task.status !== 'SUBMITTED') throw new Error('Task must be in SUBMITTED status to reject');
    if (!note) throw new Error('Rejection note is required');

    task.status = 'REJECTED';
    workflow.addStatusHistory(task, managerId, `Task rejected: ${note}`);
    await task.save();
    return task;
};

const deleteTask = async (taskId, companyId) => {
    const task = await Task.findOne({ _id: taskId, companyId });
    if (!task) throw new Error('Task not found');
    const projectId = task.projectId;

    await Task.findByIdAndDelete(taskId);

    // Update project progress
    await updateProjectProgress(projectId);

    return task;
};

// ── TASK TIME LOGS ────────────────────────────────────────────────

const getTaskTimeLogs = async (taskId, companyId) => {
    // Verify task belongs to company
    const task = await Task.findOne({ _id: taskId, companyId })
        .populate('assignedTo', 'name')
        .populate('projectId', 'name');
    if (!task) throw new Error('Task not found');

    const logs = await TimeLog.find({ taskId })
        .populate('userId', 'name email empId')
        .sort({ date: -1 });

    const totalLoggedMinutes = logs.reduce((s, l) => s + (l.duration || 0), 0);
    const totalLoggedHours = +(totalLoggedMinutes / 60).toFixed(2);
    const estimatedHours = task.estimatedHours || 0;
    const delta = +(totalLoggedHours - estimatedHours).toFixed(2);

    return {
        task,
        logs,
        summary: {
            estimatedHours,
            totalLoggedHours,
            delta,
            status: delta > 0 ? 'OVERRUN' : delta < 0 ? 'UNDERRUN' : 'ON_TRACK',
        },
    };
};

// ── WORKLOAD ──────────────────────────────────────────────────────

const getWorkload = async (companyId) => {
    // Get all employees in the company
    const employees = await User.find({ companyId, role: 'EMPLOYEE' }).select('name email empId');

    // For each employee get active task count + total logged hours
    const workload = await Promise.all(
        employees.map(async (emp) => {
            const [activeTasks, timeLogs] = await Promise.all([
                Task.countDocuments({
                    companyId,
                    assignedTo: emp._id,
                    status: { $in: ['TODO', 'IN_PROGRESS', 'SUBMITTED'] },
                }),
                TimeLog.find({ userId: emp._id }),
            ]);

            const totalMinutes = timeLogs.reduce((s, l) => s + (l.duration || 0), 0);
            const totalHours = +(totalMinutes / 60).toFixed(1);

            return {
                employee: emp,
                activeTasks,
                totalLoggedHours: totalHours,
            };
        })
    );

    return workload;
};

// ── EMPLOYEES BY TEAM ─────────────────────────────────────────────

const getEmployeesByTeam = async (teamId, companyId) => {
    const query = { companyId, role: 'EMPLOYEE' };
    if (teamId) query.teamId = teamId;
    return await User.find(query).select('name email empId teamId');
};

module.exports = {
    getProjects,
    createProject,
    updateProject,
    deleteProject,
    getTasks,
    createTask,
    updateTask,
    deleteTask,
    getTaskTimeLogs,
    getWorkload,
    getEmployeesByTeam,
    approveTask,
    rejectTask,
    completeProject,
};
