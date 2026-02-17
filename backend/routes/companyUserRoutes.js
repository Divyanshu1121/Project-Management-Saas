const express = require('express');
const router = express.Router();
const { createCompanyUser, getCompanyUsers, deleteCompanyUser, createEmployee, deleteEmployee } = require('../controllers/companyUserController');
const { protect } = require('../middleware/authMiddleware');

const { roleCheck } = require('../middleware/roleMiddleware');

const LEADERSHIP_ROLES = ['COMPANY_OWNER', 'CEO', 'CTO', 'CFO', 'COO'];
const OWNER_ROLES = ['COMPANY_OWNER', 'CEO'];

router.post('/users', protect, roleCheck(OWNER_ROLES), createCompanyUser);
router.post('/employees', protect, roleCheck(OWNER_ROLES), createEmployee);
router.get('/users', protect, roleCheck(LEADERSHIP_ROLES), getCompanyUsers);
router.delete('/users/:id', protect, roleCheck(OWNER_ROLES), deleteCompanyUser);
router.delete('/employees/:id', protect, roleCheck(OWNER_ROLES), deleteEmployee);

module.exports = router;
