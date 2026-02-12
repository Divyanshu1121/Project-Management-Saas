const express = require('express');
const router = express.Router();
const { createSprint, getSprints } = require('../controllers/sprintController');
const { protect } = require('../middleware/authMiddleware');
const { roleCheck } = require('../middleware/roleMiddleware');

router.post('/', protect, roleCheck(['COMPANY_OWNER', 'PROJECT_MANAGER']), createSprint);
router.get('/:projectId', protect, getSprints);

module.exports = router;
