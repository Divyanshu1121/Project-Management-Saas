const express = require('express');
const router = express.Router();
const { createProject, getProjects } = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware');
const { roleCheck } = require('../middleware/roleMiddleware');

router.post('/', protect, roleCheck(['COMPANY_OWNER', 'PROJECT_MANAGER']), createProject);
router.get('/', protect, getProjects);
router.delete('/:id', protect, roleCheck(['COMPANY_OWNER', 'PROJECT_MANAGER']), require('../controllers/projectController').deleteProject);

module.exports = router;
