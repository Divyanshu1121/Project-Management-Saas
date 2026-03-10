const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/activityLogController');
const { protect } = require('../middleware/authMiddleware');
const { roleCheck } = require('../middleware/roleMiddleware');

const auth = [protect];

const authManagement = [protect, roleCheck(['OWNER', 'PROJECT_MANAGER', 'HR'])];

router.get('/project/:projectId', ...auth, ctrl.getProjectActivity);
router.get('/task/:taskId', ...auth, ctrl.getTaskActivity);
router.get('/company', ...authManagement, ctrl.getCompanyActivity);

module.exports = router;
