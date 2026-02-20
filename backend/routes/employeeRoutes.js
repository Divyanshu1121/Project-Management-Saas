const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { roleCheck } = require('../middleware/roleMiddleware');
const Task = require('../models/Task');
const TimeLog = require('../models/TimeLog');

const workflow = require('../services/taskWorkflowService');

const employeeOnly = roleCheck(['EMPLOYEE']);

// ── Tasks ─────────────────────────────────────────────────────────
// GET /api/employee/tasks  — only tasks assigned to me
router.get('/tasks', protect, employeeOnly, async (req, res) => {
    try {
        const tasks = await Task.find({ assignedTo: req.user._id })
            .populate('projectId', 'name')
            .populate('teamId', 'name')
            .sort({ createdAt: -1 });
        res.json(tasks);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

// PUT /api/employee/tasks/:id  — update only status/subtasks on MY task
// Allowed transitions: TODO→IN_PROGRESS, IN_PROGRESS→SUBMITTED
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

        // 1. Handle subtask updates
        if (subtasks) {
            task.subtasks = subtasks;
            task.progress = workflow.calculateProgress(subtasks);
        }

        // 2. Handle status transitions
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

            // Specific validation for SUBMITTED
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

        const updated = await Task.findById(task._id)
            .populate('projectId', 'name')
            .populate('teamId', 'name');

        res.json(updated);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

// ── Time Logs ─────────────────────────────────────────────────────
// GET /api/employee/time-logs  — only MY time logs
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

// POST /api/employee/time-logs  — log time; userId always forced to me
router.post('/time-logs', protect, employeeOnly, async (req, res) => {
    try {
        const { taskId, date, startTime, endTime, duration, description } = req.body;

        if (!taskId) return res.status(400).json({ message: 'taskId is required' });

        // Verify the task is assigned to this employee
        const task = await Task.findOne({ _id: taskId, assignedTo: req.user._id });
        if (!task) return res.status(403).json({ message: 'Task not assigned to you' });

        const log = await TimeLog.create({
            userId: req.user._id,   // always forced — never from body
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

// DELETE /api/employee/time-logs/:id  — delete own log only
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
