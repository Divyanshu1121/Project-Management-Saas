const express = require('express');
const router = express.Router();
const {
    createSprint,
    getSprints,
    getActiveSprint,
    startSprint,
    completeSprint,
    assignTaskToSprint,
    removeFromSprint
} = require('../controllers/sprintController');
const { protect } = require('../middleware/authMiddleware');
const { roleCheck } = require('../middleware/roleMiddleware');

router.post('/', protect, roleCheck(['COMPANY_OWNER', 'PROJECT_MANAGER']), createSprint);
router.get('/project/:projectId', protect, getSprints);
router.get('/project/:projectId/active', protect, getActiveSprint);
router.patch('/:id/start', protect, roleCheck(['PROJECT_MANAGER']), startSprint);
router.patch('/:id/complete', protect, roleCheck(['PROJECT_MANAGER']), completeSprint);
router.patch('/tasks/:taskId/assign', protect, roleCheck(['PROJECT_MANAGER']), assignTaskToSprint);
router.patch('/tasks/:taskId/remove', protect, roleCheck(['PROJECT_MANAGER']), removeFromSprint);

module.exports = router;
