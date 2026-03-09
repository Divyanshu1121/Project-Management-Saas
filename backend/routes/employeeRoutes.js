const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { roleCheck } = require('../middleware/roleMiddleware');
const Task = require('../models/Task');
const TimeLog = require('../models/TimeLog');
const User = require('../models/User');
const { createNotification } = require('../services/notificationService');

const workflow = require('../services/taskWorkflowService');
const dependencyService = require('../services/dependencyService');

const employeeOnly = roleCheck(['EMPLOYEE']);

router.get('/tasks', protect, employeeOnly, async (req, res) => {
    try {
        const tasks = await Task.find({ assignedTo: req.user._id })
            .populate('projectId', 'name')
            .populate('teamId', 'name')
            .populate('dependencies', 'status')
            .sort({ createdAt: -1 });
        res.json(tasks);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

const ALLOWED_TRANSITIONS = {
    TODO: 'IN_PROGRESS',
    IN_PROGRESS: 'SUBMITTED',
};

router.put('/tasks/:id', protect, employeeOnly, async (req, res) => {
    try {
        const task = await Task.findOne({ _id: req.params.id, assignedTo: req.user._id });
        if (!task) return res.status(404).json({ message: 'Task not found or not assigned to you' });

        const { status, subtasks, submission } = req.body;
        const oldStatus = task.status;

        if (subtasks) {
            task.subtasks = subtasks;
            task.progress = workflow.calculateProgress(subtasks);
        }

        if (status !== undefined && status !== oldStatus) {
            if (['APPROVED', 'REJECTED'].includes(status)) {
                return res.status(403).json({ message: 'Employees cannot approve or reject tasks' });
            }

            const allowed = ALLOWED_TRANSITIONS[oldStatus];
            if (status !== allowed && status !== oldStatus) {
                return res.status(400).json({
                    message: `Invalid status transition: ${oldStatus} → ${status}. Allowed: ${oldStatus} → ${allowed || 'none'}`
                });
            }

            if (['IN_PROGRESS', 'SUBMITTED'].includes(status)) {
                const isReady = await dependencyService.checkDependenciesCompleted(task._id);
                if (!isReady) {
                    return res.status(400).json({ message: 'Cannot start or submit task: all dependent tasks must be APPROVED first.' });
                }
            }

            if (status === 'SUBMITTED') {
                if (task.progress < 100) {
                    return res.status(400).json({ message: 'Task must be 100% complete to submit.' });
                }
                if (!submission || !submission.comment) {
                    return res.status(400).json({ message: 'Submission comment is required.' });
                }
                task.submission = {
                    comment: submission.comment,
                    attachmentUrl: submission.attachmentUrl,
                    submittedAt: new Date()
                };
            }

            task.status = status;
            workflow.addStatusHistory(task, req.user._id, status === 'SUBMITTED' ? submission.comment : `Status updated to ${status}`);
        }

        await task.save();

        // Notify manager when employee submits task
        if (status === 'SUBMITTED') {
            try {
                const managers = await User.find({ companyId: req.user.companyId, role: 'PROJECT_MANAGER' }).select('_id');
                await Promise.all(managers.map(mgr =>
                    createNotification({
                        recipientId: mgr._id,
                        companyId: req.user.companyId,
                        type: 'TASK_SUBMITTED',
                        title: 'Task submitted for review',
                        message: `${req.user.name} submitted task "${task.title}" for your review.`,
                        link: '/manager/tasks',
                        metadata: { taskId: task._id },
                    })
                ));
            } catch (notifErr) {
                console.error('[Employee] Submit notification error:', notifErr.message);
            }
        }

        const updated = await Task.findById(task._id)
            .populate('projectId', 'name')
            .populate('teamId', 'name');

        res.json(updated);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

router.get('/time-logs', protect, employeeOnly, async (req, res) => {
    try {
        const logs = await TimeLog.find({ userId: req.user._id })
            .populate('taskId', 'title')
            .sort({ date: -1 });
        res.json(logs);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

router.post('/time-logs', protect, employeeOnly, async (req, res) => {
    try {
        const { taskId, date, startTime, endTime, duration, description } = req.body;

        if (!taskId) return res.status(400).json({ message: 'taskId is required' });

        const task = await Task.findOne({ _id: taskId, assignedTo: req.user._id });
        if (!task) return res.status(403).json({ message: 'Task not assigned to you' });

        const log = await TimeLog.create({
            userId: req.user._id,
            taskId,
            date,
            startTime,
            endTime,
            duration,
            description,
        });

        const populated = await TimeLog.findById(log._id).populate('taskId', 'title');
        res.status(201).json(populated);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

router.delete('/time-logs/:id', protect, employeeOnly, async (req, res) => {
    try {
        const log = await TimeLog.findOne({ _id: req.params.id, userId: req.user._id });
        if (!log) return res.status(404).json({ message: 'Log not found or not yours' });
        await log.deleteOne();
        res.json({ message: 'Log deleted' });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

module.exports = router;
