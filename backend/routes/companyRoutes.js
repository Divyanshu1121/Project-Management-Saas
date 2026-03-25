const express = require('express');
const router = express.Router();
const { registerCompany, getCompanies, updateCompany, deleteCompany } = require('../controllers/companyController');
const { protect } = require('../middleware/authMiddleware');
const { roleCheck } = require('../middleware/roleMiddleware');

router.post('/', protect, roleCheck(['SUPER_ADMIN', 'superadmin']), registerCompany);
router.get('/', protect, roleCheck(['SUPER_ADMIN', 'superadmin']), getCompanies);
router.put('/:id', protect, roleCheck(['SUPER_ADMIN', 'superadmin']), updateCompany);
router.delete('/:id', protect, roleCheck(['SUPER_ADMIN', 'superadmin']), deleteCompany);

module.exports = router;
