const express = require('express');
const router = express.Router();
const { createTask, getTasks, updateTask, deleteTask } = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');
const { roleCheck } = require('../middleware/roleMiddleware');

const LEADER_ROLES = ['COMPANY_OWNER', 'CEO', 'CTO', 'CFO', 'COO', 'PROJECT_MANAGER'];

router.post('/', protect, roleCheck(LEADER_ROLES), createTask);
router.get('/', protect, roleCheck(LEADER_ROLES), getTasks);
router.put('/:id', protect, roleCheck(LEADER_ROLES), updateTask);
router.delete('/:id', protect, roleCheck(LEADER_ROLES), deleteTask);

module.exports = router;
