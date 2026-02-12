const companyService = require('../services/companyService');

// @desc    Register a new company and owner
// @route   POST /api/companies
// @access  Private (Super Admin)
const registerCompany = async (req, res) => {
    const { companyName, ownerName, ownerEmail, ownerPassword } = req.body;

    try {
        const result = await companyService.createCompany(
            { name: companyName },
            { name: ownerName, email: ownerEmail, password: ownerPassword }
        );
        res.status(201).json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get all companies
// @route   GET /api/companies
// @access  Private (Super Admin)
const getCompanies = async (req, res) => {
    try {
        const companies = await companyService.getAllCompanies();
        res.json(companies);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update company (plan/status)
// @route   PUT /api/companies/:id
// @access  Private (Super Admin)
const updateCompany = async (req, res) => {
    try {
        const company = await companyService.updateCompany(req.params.id, req.body);
        res.json(company);
    } catch (error) {
        res.status(400).json({ message: 'Error updating company' });
    }
};

// @desc    Delete company
// @route   DELETE /api/companies/:id
// @access  Private (Super Admin)
const deleteCompany = async (req, res) => {
    try {
        await companyService.deleteCompany(req.params.id);
        res.json({ message: 'Company deleted' });
    } catch (error) {
        res.status(400).json({ message: 'Error deleting company' });
    }
};

module.exports = {
    registerCompany,
    getCompanies,
    updateCompany,
    deleteCompany,
};
