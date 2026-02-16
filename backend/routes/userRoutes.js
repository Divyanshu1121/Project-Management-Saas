const express = require('express');
const router = express.Router();
const { createProjectManager, getUsers } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { roleCheck } = require('../middleware/roleMiddleware');

router.post('/project-manager', protect, roleCheck(['COMPANY_OWNER']), createProjectManager);
router.get('/', protect, roleCheck(['COMPANY_OWNER', 'PROJECT_MANAGER', 'SUPER_ADMIN']), getUsers);

module.exports = router;
