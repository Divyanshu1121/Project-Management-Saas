const express = require('express');
const router = express.Router();
const {
    submitWFHRequest,
    getMyWFHRequests,
    getCompanyWFHRequests,
    reviewWFHRequest,
    cancelWFHRequest,
    getWFHCalendar,
    getTodayStatuses,
} = require('../controllers/wfhController');

const { protect } = require('../middleware/authMiddleware');
const { roleCheck } = require('../middleware/roleMiddleware');

const HR_ROLES = ['COMPANY_OWNER', 'owner', 'CEO', 'CTO', 'CFO', 'COO', 'HR'];
const PM_ROLES = [...HR_ROLES, 'PROJECT_MANAGER'];

// Employee routes
router.post('/request', protect, submitWFHRequest);
router.get('/my-requests', protect, getMyWFHRequests);
router.patch('/:id/cancel', protect, cancelWFHRequest);

// HR routes
router.get('/company-requests', protect, roleCheck(HR_ROLES), getCompanyWFHRequests);
router.patch('/:id/review', protect, roleCheck(HR_ROLES), reviewWFHRequest);
router.get('/calendar', protect, getWFHCalendar); // scope param controls what each role sees

// PM / cross-panel routes
router.get('/today-status', protect, roleCheck(PM_ROLES), getTodayStatuses);

module.exports = router;
