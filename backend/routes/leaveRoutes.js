const express = require('express');
const router = express.Router();
const {
    requestLeave,
    getMyLeaves,
    getCompanyLeaves,
    updateLeaveStatus,
    checkConflicts,
    getUnavailableEmployees,
    getUpcomingLeaves
} = require('../controllers/leaveController');

const { protect } = require('../middleware/authMiddleware');
const { roleCheck } = require('../middleware/roleMiddleware');

const LEADERSHIP_ROLES = ['COMPANY_OWNER', 'CEO', 'CTO', 'CFO', 'COO', 'HR'];
const PM_ROLES = [...LEADERSHIP_ROLES, 'PROJECT_MANAGER'];

router.post('/', protect, requestLeave);
router.get('/my', protect, getMyLeaves);
router.get('/', protect, roleCheck(PM_ROLES), getCompanyLeaves);
router.put('/:id', protect, roleCheck(LEADERSHIP_ROLES), updateLeaveStatus);
router.get('/conflicts', protect, roleCheck(PM_ROLES), checkConflicts);
router.get('/unavailable', protect, getUnavailableEmployees);
router.get('/upcoming', protect, getUpcomingLeaves);

module.exports = router;
