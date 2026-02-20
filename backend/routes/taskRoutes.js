const express = require('express');
const router = express.Router();
const { createTask, getTasks, updateTask, deleteTask } = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');
const { roleCheck } = require('../middleware/roleMiddleware');

router.post('/', protect, roleCheck(['COMPANY_OWNER', 'PROJECT_MANAGER']), createTask);
router.get('/', protect, getTasks);
router.put('/:id', protect, roleCheck(['COMPANY_OWNER', 'PROJECT_MANAGER']), updateTask);
router.delete('/:id', protect, roleCheck(['COMPANY_OWNER', 'PROJECT_MANAGER']), deleteTask);

module.exports = router;
