// src/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const Session = require('../models/Session');
const User = require('../models/User');
const { AppError } = require('../utils/errorHandler');

// Authentication Middleware
const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      throw new AppError('No authentication token provided', 401);
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if session is active
    const session = await Session.findOne({
      userId: decoded.id,
      token,
      isActive: true,
      expiresAt: { $gt: Date.now() }
    });

    if (!session) {
      throw new AppError('Invalid or expired token', 401);
    }

    // Feature routes decide whether ACTIVE is required so onboarding/review
    // flows can still render for non-active users.
    const user = await User.findById(decoded.id);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (user.accountStatus === 'BANNED') {
      throw new AppError('Your account has been banned. Contact administrator.', 403);
    }

    req.user = { id: decoded.id, ...user.toObject() };
    req.token = token;

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Token has expired', 401));
    }
    if (error.name === 'JsonWebTokenError') {
      return next(new AppError('Invalid token', 401));
    }
    next(error);
  }
};

// Authorization Middleware - Check user role
const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('User not authenticated', 401));
    }

    if (roles.length && !roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to access this resource', 403));
    }

    next();
  };
};

module.exports = {
  authenticate,
  authorize
};
