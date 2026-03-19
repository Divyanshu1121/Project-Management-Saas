const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe, signup, verifyEmail, resendVerification } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const rateLimit = require('express-rate-limit');
const { body } = require('express-validator');

const signupLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 5,
    message: { message: 'Too many accounts created from this IP, please try again after an hour' }
});

const validateSignup = [
    body('name').notEmpty().withMessage('Name is required').trim().escape(),
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').isStrongPassword({
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 0,
    }).withMessage('Password must be at least 8 chars long with uppercase, lowercase, and a number'),
    body('phone').notEmpty().withMessage('Phone is required').trim().escape(),
    body('companyName').notEmpty().withMessage('Company name is required').trim().escape(),
    body('companySize').notEmpty().withMessage('Company size is required').trim().escape(),
    body('industry').notEmpty().withMessage('Industry is required').trim().escape(),
    body('country').notEmpty().withMessage('Country is required').trim().escape(),
    body('city').notEmpty().withMessage('City is required').trim().escape(),
];

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);

// New B2B SaaS endpoints
router.post('/signup', signupLimiter, validateSignup, signup);
router.post('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerification);

module.exports = router;
