const express = require('express');
const router = express.Router();
const { createProject, getProjects, updateProject, deleteProject } = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware');
const { roleCheck } = require('../middleware/roleMiddleware');

const managerOrOwner = roleCheck(['COMPANY_OWNER', 'owner', 'CEO', 'CTO', 'CFO', 'COO', 'PROJECT_MANAGER']);

router.post('/', protect, managerOrOwner, createProject);
router.get('/', protect, managerOrOwner, getProjects);
router.put('/:id', protect, managerOrOwner, updateProject);
router.delete('/:id', protect, managerOrOwner, deleteProject);

module.exports = router;
