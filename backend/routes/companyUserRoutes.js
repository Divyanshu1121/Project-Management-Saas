const express = require('express');
const router = express.Router();
const { createProjectManager } = require('../controllers/companyUserController');
const { protect } = require('../middleware/authMiddleware');

const { roleCheck } = require('../middleware/roleMiddleware');

router.post('/project-manager', protect, roleCheck(['COMPANY_OWNER']), createProjectManager);

module.exports = router;
