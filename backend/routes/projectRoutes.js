const express = require('express');
const router = express.Router();
const { createProject, getProjects } = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware');
const { roleCheck } = require('../middleware/roleMiddleware');

router.post('/', protect, roleCheck(['COMPANY_OWNER', 'PROJECT_MANAGER']), createProject);
router.get('/', protect, getProjects); // accessible by all authenticated users in the company

module.exports = router;
