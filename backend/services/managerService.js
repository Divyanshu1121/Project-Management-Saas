const Project = require('../models/Project');
const Task = require('../models/Task');
const TimeLog = require('../models/TimeLog');
const User = require('../models/User');
const workflow = require('./taskWorkflowService');
const dependencyService = require('./dependencyService');
const { createNotification } = require('./notificationService');
const { logActivity } = require('./activityLogService');

const sanitizeObjectIdFields = (data, fields) => {
    const cleaned = { ...data };
    for (const field of fields) {
        if (cleaned[field] === '' || cleaned[field] === null || cleaned[field] === undefined) {
            delete cleaned[field];
        }
    }
    return cleaned;
};


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

    const manager = await User.findById(managerId).select('name');
    logActivity({
        userId: managerId,
        actionType: 'PROJECT_CREATED',
        entityType: 'project',
        entityId: project._id,
        projectId: project._id,
        companyId,
        message: `${manager?.name || 'Manager'} created project "${project.name}"`,
        metadata: { projectId: project._id, name: project.name },
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

    const manager = await User.findById(managerId).select('name');
    logActivity({
        userId: managerId,
        actionType: 'PROJECT_COMPLETED',
        entityType: 'project',
        entityId: project._id,
        projectId: project._id,
        companyId,
        message: `${manager?.name || 'Manager'} marked project "${project.name}" as completed`,
        metadata: { projectId: project._id },
    });

    return project;
};

const getTasks = async (companyId, filters = {}) => {
    const query = { companyId };

    if (filters.projectId) query.projectId = filters.projectId;
    if (filters.teamId) query.teamId = filters.teamId;
    if (filters.status) query.status = filters.status;
    if (filters.priority) query.priority = filters.priority;

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
    const clean = sanitizeObjectIdFields(data, ['assignedTo', 'teamId', 'sprintId']);

    const project = await Project.findOne({ _id: clean.projectId, companyId });
    if (!project) throw new Error('Project not found or does not belong to your company');

    if (clean.assignedTo) {
        const employee = await User.findOne({ _id: clean.assignedTo, companyId });
        if (!employee) throw new Error('Assigned employee does not belong to your company');
    }

    if (clean.subtasks) {
        clean.progress = workflow.calculateProgress(clean.subtasks);
    }

    const task = new Task({
        ...clean,
        companyId,
    });

    workflow.addStatusHistory(task, managerId, 'Task created');

    await task.save();

    await updateProjectProgress(clean.projectId);

    const populatedTask = await Task.findById(task._id)
        .populate('assignedTo', 'name email empId')
        .populate('projectId', 'name')
        .populate('teamId', 'name');

    const manager = await User.findById(managerId).select('name');

    // Log task creation
    logActivity({
        userId: managerId,
        actionType: 'TASK_CREATED',
        entityType: 'task',
        entityId: task._id,
        projectId: clean.projectId,
        companyId,
        message: `${manager?.name || 'Manager'} created task "${task.title}"`,
        metadata: { taskId: task._id, title: task.title, priority: task.priority },
    });

    if (clean.assignedTo) {
        // Log assignment
        const assignee = populatedTask.assignedTo;
        logActivity({
            userId: managerId,
            actionType: 'TASK_ASSIGNED',
            entityType: 'task',
            entityId: task._id,
            projectId: clean.projectId,
            companyId,
            message: `${manager?.name || 'Manager'} assigned "${task.title}" to ${assignee?.name || 'an employee'}`,
            metadata: { taskId: task._id, assigneeId: clean.assignedTo },
        });

        await createNotification({
            recipientId: clean.assignedTo,
            companyId,
            type: 'TASK_ASSIGNED',
            title: 'New task assigned to you',
            message: `${manager?.name || 'Manager'} assigned you "${task.title}"`,
            link: '/employee/tasks',
            metadata: { taskId: task._id },
        });
    }

    if (clean.deadline) {
        logActivity({
            userId: managerId,
            actionType: 'TASK_DEADLINE_UPDATED',
            entityType: 'task',
            entityId: task._id,
            projectId: clean.projectId,
            companyId,
            message: `Deadline set for "${task.title}": ${new Date(clean.deadline).toDateString()}`,
            metadata: { taskId: task._id, deadline: clean.deadline },
        });
    }

    return populatedTask;
};

const updateTask = async (taskId, companyId, data, userId) => {
    const clean = sanitizeObjectIdFields(data, ['assignedTo', 'teamId', 'sprintId']);

    const task = await Task.findOne({ _id: taskId, companyId });
    if (!task) throw new Error('Task not found');

    const oldStatus = task.status;
    const oldAssignedTo = task.assignedTo?.toString();
    const oldDeadline = task.deadline;

    if (clean.subtasks) {
        clean.progress = workflow.calculateProgress(clean.subtasks);
    }

    Object.assign(task, clean);

    if (clean.status && clean.status !== oldStatus) {
        if (['IN_PROGRESS', 'SUBMITTED', 'APPROVED'].includes(clean.status)) {
            const isReady = await dependencyService.checkDependenciesCompleted(taskId);
            if (!isReady) throw new Error(`Cannot update status to ${clean.status}: dependent tasks must be APPROVED first.`);
        }
        workflow.addStatusHistory(task, userId, clean.statusNote || 'Status updated by manager');
    }

    await task.save();
    await updateProjectProgress(task.projectId);

    const updatedTask = await Task.findById(task._id)
        .populate('assignedTo', 'name email empId')
        .populate('projectId', 'name')
        .populate('teamId', 'name');

    const actor = await User.findById(userId).select('name');
    const actorName = actor?.name || 'Manager';

    // Status change log
    if (clean.status && clean.status !== oldStatus) {
        logActivity({
            userId,
            actionType: 'TASK_STATUS_CHANGED',
            entityType: 'task',
            entityId: task._id,
            projectId: task.projectId,
            companyId,
            message: `${actorName} changed status of "${task.title}" from ${oldStatus} → ${clean.status}`,
            metadata: { taskId: task._id, oldStatus, newStatus: clean.status },
        });
    }

    // Assignment change log
    if (clean.assignedTo !== undefined && clean.assignedTo?.toString() !== oldAssignedTo) {
        const newAssigneeName = updatedTask.assignedTo?.name || 'Unassigned';
        logActivity({
            userId,
            actionType: clean.assignedTo ? 'TASK_ASSIGNED' : 'TASK_UNASSIGNED',
            entityType: 'task',
            entityId: task._id,
            projectId: task.projectId,
            companyId,
            message: clean.assignedTo
                ? `${actorName} re-assigned "${task.title}" to ${newAssigneeName}`
                : `${actorName} removed assignment from "${task.title}"`,
            metadata: { taskId: task._id, oldAssignedTo, newAssignedTo: clean.assignedTo },
        });
    }

    // Deadline change log
    if (clean.deadline !== undefined) {
        const oldD = oldDeadline ? new Date(oldDeadline).toDateString() : 'none';
        const newD = clean.deadline ? new Date(clean.deadline).toDateString() : 'none';
        if (oldD !== newD) {
            logActivity({
                userId,
                actionType: 'TASK_DEADLINE_UPDATED',
                entityType: 'task',
                entityId: task._id,
                projectId: task.projectId,
                companyId,
                message: `${actorName} updated deadline of "${task.title}" from ${oldD} → ${newD}`,
                metadata: { taskId: task._id, oldDeadline, newDeadline: clean.deadline },
            });
        }
    }

    // General field changes — only log truly display-worthy fields that actually changed
    const DISPLAY_FIELDS = {
        title: { label: 'title' },
        description: { label: 'description' },
        priority: { label: 'priority' },
        estimatedHours: { label: 'estimated hours' },
        definitionOfDone: { label: 'definition of done' },
        startDate: { label: 'start date', fmt: (v) => v ? new Date(v).toDateString() : 'none' },
    };

    // Store old values BEFORE Object.assign so we can diff them (captured above)
    // We use the `task` object which has already been updated, so compare against the
    // original values stored before the update was applied.
    const originalTask = await Task.findById(task._id).lean(); // already saved, compare via clean
    const changedLabels = [];
    for (const [field, meta] of Object.entries(DISPLAY_FIELDS)) {
        if (!(field in clean)) continue;
        const fmt = meta.fmt || ((v) => String(v ?? ''));
        // Compare string representations to avoid type mismatches
        const oldVal = fmt(originalTask[field]);
        const newVal = fmt(clean[field]);
        if (oldVal !== newVal) changedLabels.push(meta.label);
    }

    if (changedLabels.length > 0) {
        logActivity({
            userId,
            actionType: 'TASK_UPDATED',
            entityType: 'task',
            entityId: task._id,
            projectId: task.projectId,
            companyId,
            message: `${actorName} updated ${changedLabels.join(', ')} of "${task.title}"`,
            metadata: { taskId: task._id, updatedFields: changedLabels },
        });
    }

    return updatedTask;
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

    await updateProjectProgress(task.projectId);

    const manager = await User.findById(managerId).select('name');

    logActivity({
        userId: managerId,
        actionType: 'TASK_APPROVED',
        entityType: 'task',
        entityId: task._id,
        projectId: task.projectId,
        companyId,
        message: `${manager?.name || 'Manager'} approved task "${task.title}"`,
        metadata: { taskId: task._id },
    });

    if (task.assignedTo) {
        await createNotification({
            recipientId: task.assignedTo,
            companyId,
            type: 'TASK_APPROVED',
            title: 'Task approved ✅',
            message: `${manager?.name || 'Manager'} approved your task "${task.title}"`,
            link: '/employee/tasks',
            metadata: { taskId: task._id },
        });
    }

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

    const manager = await User.findById(managerId).select('name');

    logActivity({
        userId: managerId,
        actionType: 'TASK_REJECTED',
        entityType: 'task',
        entityId: task._id,
        projectId: task.projectId,
        companyId,
        message: `${manager?.name || 'Manager'} rejected task "${task.title}": ${note}`,
        metadata: { taskId: task._id, note },
    });

    if (task.assignedTo) {
        await createNotification({
            recipientId: task.assignedTo,
            companyId,
            type: 'TASK_REJECTED',
            title: 'Task rejected ❌',
            message: `${manager?.name || 'Manager'} rejected your task "${task.title}": ${note}`,
            link: '/employee/tasks',
            metadata: { taskId: task._id },
        });
    }

    return task;
};

const deleteTask = async (taskId, companyId, userId) => {
    const task = await Task.findOne({ _id: taskId, companyId });
    if (!task) throw new Error('Task not found');
    const projectId = task.projectId;

    await Task.findByIdAndDelete(taskId);
    await updateProjectProgress(projectId);

    const actor = await User.findById(userId).select('name');
    logActivity({
        userId,
        actionType: 'TASK_DELETED',
        entityType: 'task',
        entityId: task._id,
        projectId,
        companyId,
        message: `${actor?.name || 'Manager'} deleted task "${task.title}"`,
        metadata: { taskId: task._id, title: task.title },
    });

    return task;
};


const getTaskTimeLogs = async (taskId, companyId) => {
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


const getWorkload = async (companyId) => {
    const employees = await User.find({ companyId, role: 'EMPLOYEE' }).select('name email empId');

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
