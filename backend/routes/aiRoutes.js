const express = require('express');
const router = express.Router();
const { generateTaskContent } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');
const { roleCheck } = require('../middleware/roleMiddleware');

router.post('/generate-task-content', protect, roleCheck(['PROJECT_MANAGER']), generateTaskContent);

module.exports = router;
