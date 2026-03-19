const authService = require('../services/authService');
const User = require('../models/User');
const Company = require('../models/Company');
const crypto = require('crypto');
const mongoose = require('mongoose');
const { validationResult } = require('express-validator');
const sendEmail = require('../utils/sendEmail');
const emailTemplates = require('../utils/emailTemplates');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    try {
        const user = await authService.register(req.body);
        res.status(201).json(user);
    } catch (error) {
        if (error.message === 'User already exists') {
            return res.status(400).json({ message: error.message });
        }
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await authService.login(email, password);
        res.json(user);
    } catch (error) {
        const knownErrors = ['Invalid email or password', 'Your account is deactivated'];
        if (knownErrors.includes(error.message)) {
            return res.status(401).json({ message: error.message });
        }
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get user data
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
    const user = {
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        companyId: req.user.companyId,
    };
    res.status(200).json(user);
};

const signup = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });
    }

    const { name, email, password, phone, companyName, companySize, industry, website, country, city } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'Email already exists' });

    const companyExists = await Company.findOne({ $or: [{ name: companyName }, { companyName }] });
    if (companyExists) return res.status(400).json({ message: 'Company name already exists' });

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const randomCompHex = crypto.randomBytes(3).toString('hex').toUpperCase();
        const randomUsrHex = crypto.randomBytes(3).toString('hex').toUpperCase();
        const companyIdStr = `COMP-${new Date().getFullYear()}-${randomCompHex}`;
        const userIdStr = `USR-${new Date().getFullYear()}-${randomUsrHex}`;
        const verificationToken = crypto.randomBytes(32).toString('hex');
        
        const newCompanyId = new mongoose.Types.ObjectId();
        const newUserId = new mongoose.Types.ObjectId();

        const skipVerify = process.env.SKIP_EMAIL_VERIFICATION === 'true';

        const newCompany = new Company({
            _id: newCompanyId,
            companyId: companyIdStr,
            name: companyName,
            companyName,
            companySize,
            industry,
            website,
            country,
            city,
            plan: 'free',
            trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            isTrialActive: true,
            signupType: "self-serve",
            isEmailVerified: skipVerify,
            isActive: true,
            ownerId: newUserId
        });

        const newUser = new User({
            _id: newUserId,
            userId: userIdStr,
            name,
            email,
            password,
            phone,
            role: 'owner',
            company: newCompanyId,
            companyId: newCompanyId,
            companyCode: companyIdStr,
            isActive: true,
            isEmailVerified: skipVerify,
            emailVerificationToken: skipVerify ? undefined : verificationToken,
            emailVerificationExpires: skipVerify ? undefined : new Date(Date.now() + 24 * 60 * 60 * 1000)
        });

        await newCompany.save({ session });
        await newUser.save({ session });

        await session.commitTransaction();
        session.endSession();

        if (!skipVerify) {
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
            const verifyUrl = `${frontendUrl}/verify-email?token=${verificationToken}`;
            try {
                await sendEmail({
                    email,
                    subject: 'Verify your email address',
                    html: emailTemplates.verification(name, verifyUrl)
                });
            } catch (emailErr) {
                console.error('Email sending failed but signup continuing:', emailErr);
            }
        }

        res.status(201).json({ 
            success: true,
            message: skipVerify ? 'Signup successful! You can now login.' : 'Signup successful. Please check your email to verify your account.',
            skipVerification: skipVerify
        });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error('Signup error:', error);
        res.status(500).json({ message: error.message || 'Server error' });
    }
};

const verifyEmail = async (req, res) => {
    const { token } = req.query;
    if (!token) return res.status(400).json({ message: 'Token is required' });

    try {
        const user = await User.findOne({ 
            emailVerificationToken: token,
            emailVerificationExpires: { $gt: Date.now() }
        });

        if (!user) return res.status(400).json({ message: 'Invalid or expired verification token' });

        user.isEmailVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationExpires = undefined;
        await user.save();

        if (user.companyId || user.company) {
            await Company.findByIdAndUpdate(user.companyId || user.company, { isEmailVerified: true });
        }

        res.json({ message: 'Email verified successfully. You can now login.' });
    } catch (error) {
        console.error('Verify email error:', error);
        res.status(500).json({ message: 'Server error during email verification' });
    }
};

const resendVerification = async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'User not found' });
        if (user.isEmailVerified) return res.status(400).json({ message: 'Email is already verified' });

        const token = crypto.randomBytes(32).toString('hex');
        user.emailVerificationToken = token;
        user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
        await user.save();

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const verifyUrl = `${frontendUrl}/verify-email?token=${token}`;
        await sendEmail({
            email,
            subject: 'Verify your email address',
            html: emailTemplates.verification(user.name, verifyUrl)
        });
        
        res.json({ message: 'Verification email sent' });
    } catch (error) {
        console.error('Resend verification error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getMe,
    signup,
    verifyEmail,
    resendVerification,
};
