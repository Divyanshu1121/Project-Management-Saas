const express = require('express');
const router = express.Router();
const { generateTaskContent, improveWriting } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');
const { roleCheck } = require('../middleware/roleMiddleware');

router.post('/generate-task-content', protect, roleCheck(['PROJECT_MANAGER']), generateTaskContent);
router.post('/improve-writing', protect, improveWriting);

module.exports = router;
