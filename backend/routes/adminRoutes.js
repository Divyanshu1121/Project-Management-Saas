const express = require('express');
const router = express.Router();
const { getCompaniesWithStats, getPlatformUsers } = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { roleCheck } = require('../middleware/roleMiddleware');

router.use(protect);
router.use(roleCheck(['SUPER_ADMIN', 'superadmin']));

router.get('/companies', getCompaniesWithStats);
router.get('/users', getPlatformUsers);

module.exports = router;
