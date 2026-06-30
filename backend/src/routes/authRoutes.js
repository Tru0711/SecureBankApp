// src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authLimiter } = require('../middleware/securityMiddleware');
const { authenticate } = require('../middleware/authMiddleware');

// Public routes
router.post('/register', authLimiter, authController.register);
router.post('/login', authLimiter, authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/send-otp', authController.sendOTP);
router.post('/resend-otp', authController.resendOTP);
router.post('/verify-otp', authController.verifyOTP);

// Protected routes
router.post('/refresh-token', authController.refreshToken);
router.post('/verify-email', authenticate, authController.verifyEmail);
router.post('/logout', authenticate, authController.logout);

module.exports = router;
