const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/managerController');
const { protect } = require('../middleware/authMiddleware');
const { roleCheck } = require('../middleware/roleMiddleware');

const pm = [protect, roleCheck(['PROJECT_MANAGER'])];

// ── Projects ──────────────────────────────────────────────
router.get('/projects', ...pm, ctrl.getProjects);
router.post('/projects', ...pm, ctrl.createProject);
router.put('/projects/:id/complete', ...pm, ctrl.completeProject);
router.put('/projects/:id', ...pm, ctrl.updateProject);
router.delete('/projects/:id', ...pm, ctrl.deleteProject);

// ── Tasks ─────────────────────────────────────────────────
router.get('/tasks', ...pm, ctrl.getTasks);
router.post('/tasks', ...pm, ctrl.createTask);
router.put('/tasks/:id', ...pm, ctrl.updateTask);
router.post('/tasks/:id/approve', ...pm, ctrl.approveTask);
router.post('/tasks/:id/reject', ...pm, ctrl.rejectTask);
router.delete('/tasks/:id', ...pm, ctrl.deleteTask);

// ── Task Time Logs ────────────────────────────────────────
router.get('/task/:id/time-logs', ...pm, ctrl.getTaskTimeLogs);

// ── Workload ──────────────────────────────────────────────
router.get('/workload', ...pm, ctrl.getWorkload);

// ── Employees (for task assignment) ───────────────────────
router.get('/employees', ...pm, ctrl.getEmployees);

module.exports = router;
