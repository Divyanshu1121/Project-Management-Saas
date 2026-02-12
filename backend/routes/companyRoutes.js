const express = require('express');
const router = express.Router();
const { registerCompany, getCompanies, updateCompany, deleteCompany } = require('../controllers/companyController');
const { protect } = require('../middleware/authMiddleware');
const { roleCheck } = require('../middleware/roleMiddleware');

router.post('/', protect, roleCheck(['SUPER_ADMIN']), registerCompany);
router.get('/', protect, roleCheck(['SUPER_ADMIN']), getCompanies);
router.put('/:id', protect, roleCheck(['SUPER_ADMIN']), updateCompany);
router.delete('/:id', protect, roleCheck(['SUPER_ADMIN']), deleteCompany);

module.exports = router;
