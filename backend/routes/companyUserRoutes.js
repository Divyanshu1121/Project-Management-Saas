const express = require('express');
const router = express.Router();
const { createCompanyUser, getCompanyUsers, deleteCompanyUser, createEmployee, deleteEmployee, getCompanyEmployees, updateEmployee } = require('../controllers/companyUserController');
const { protect } = require('../middleware/authMiddleware');

const { roleCheck } = require('../middleware/roleMiddleware');

const LEADERSHIP_ROLES = ['COMPANY_OWNER', 'CEO', 'CTO', 'CFO', 'COO', 'HR'];
const OWNER_ROLES = ['COMPANY_OWNER', 'CEO'];
const HR_ROLES = ['COMPANY_OWNER', 'CEO', 'HR'];

router.post('/users', protect, roleCheck(OWNER_ROLES), createCompanyUser);
router.get('/users', protect, roleCheck(LEADERSHIP_ROLES), getCompanyUsers);
router.delete('/users/:id', protect, roleCheck(OWNER_ROLES), deleteCompanyUser);

router.post('/employees', protect, roleCheck(HR_ROLES), createEmployee);
router.get('/employees', protect, roleCheck(HR_ROLES), getCompanyEmployees);
router.put('/employees/:id', protect, roleCheck(HR_ROLES), updateEmployee);
router.delete('/employees/:id', protect, roleCheck(HR_ROLES), deleteEmployee);

module.exports = router;
