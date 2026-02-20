const express = require('express');
const router = express.Router();
const { getCompaniesWithStats, getPlatformUsers } = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { roleCheck } = require('../middleware/roleMiddleware');

// All routes here require SUPER_ADMIN role
router.use(protect);
router.use(roleCheck(['SUPER_ADMIN']));

router.get('/companies', getCompaniesWithStats);
router.get('/users', getPlatformUsers);

module.exports = router;
