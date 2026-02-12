const express = require('express');
const router = express.Router();
const { createTask, getTasks } = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');
const { roleCheck } = require('../middleware/roleMiddleware');

router.post('/', protect, roleCheck(['PROJECT_MANAGER']), createTask);
router.get('/', protect, getTasks);

module.exports = router;
