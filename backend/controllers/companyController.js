const companyService = require('../services/companyService');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// @desc    Register a new company and owner
// @route   POST /api/companies
// @access  Private (Super Admin)
const registerCompany = async (req, res) => {
    const { companyName, ownerName, ownerEmail, ownerPassword, plan } = req.body;

    try {
        const result = await companyService.createCompany(
            { name: companyName, plan },
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
        const mongoose = require('mongoose');
        console.log(`Connected to Database: ${mongoose.connection.name}`);

        const companies = await companyService.getAllCompanies();
        console.log(`Companies Found: ${companies.length}`);

        res.json(companies);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update company (plan/status)
// @route   PUT /api/companies/:id
// @access  Private (Super Admin)
const updateCompany = async (req, res) => {
    try {
        console.log(`Controller: Update Request for ID: ${req.params.id}`);
        const company = await companyService.updateCompany(req.params.id, req.body);
        res.json(company);
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: error.message || 'Error updating company' });
    }
};

// @desc    Delete company
// @route   DELETE /api/companies/:id
// @access  Private (Super Admin)
const deleteCompany = async (req, res) => {
    try {
        console.log(`Controller: Delete Request for ID: ${req.params.id}`);

        const { password } = req.body;

        // Verify Admin Password
        if (!password) {
            return res.status(400).json({ message: 'Admin password is required to delete a company' });
        }

        const adminUser = await User.findById(req.user._id);
        if (!adminUser) {
            return res.status(404).json({ message: 'Admin user not found' });
        }

        const isMatch = await bcrypt.compare(password, adminUser.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid admin password' });
        }

        await companyService.deleteCompany(req.params.id);
        res.json({ message: 'Company deleted' });
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: error.message || 'Error deleting company' });
    }
};

module.exports = {
    registerCompany,
    getCompanies,
    updateCompany,
    deleteCompany,
};
