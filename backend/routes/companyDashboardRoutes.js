const express = require('express');
const router = express.Router();
const { getCompanyDashboard } = require('../controllers/companyDashboardController');
const { protect } = require('../middleware/authMiddleware');

router.get('/dashboard', protect, getCompanyDashboard);

module.exports = router;
