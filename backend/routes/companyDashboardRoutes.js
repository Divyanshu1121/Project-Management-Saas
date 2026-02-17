const express = require('express');
const router = express.Router();
const { getCompanyDashboard } = require('../controllers/companyDashboardController');
const { protect } = require('../middleware/authMiddleware');

const { roleCheck } = require('../middleware/roleMiddleware');

const LEADERSHIP_ROLES = ['COMPANY_OWNER', 'CEO', 'CTO', 'CFO', 'COO'];

router.get('/dashboard', protect, roleCheck(LEADERSHIP_ROLES), getCompanyDashboard);

module.exports = router;
