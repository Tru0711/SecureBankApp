// src/middleware/securityMiddleware.js
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const { AppError } = require('../utils/errorHandler');

// Helmet security headers
const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:']
    }
  },
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  },
  frameguard: { action: 'deny' },
  noSniff: true,
  xssFilter: true
});

// Rate limiting - General
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || 15) * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || 100),
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiting - Authentication (stricter)
// Note: /api/v1/auth is mounted under server.js; applying authLimiter per-route
// avoids accidentally blocking healthchecks/other endpoints.
const authLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || 15) * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_AUTH_REQUESTS || 5),
  message: 'Too many login attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  skipFailedRequests: false
});

// Input validation - Prevent parameter pollution
const preventParameterPollution = hpp({
  whitelist: [
    'page', 'limit', 'sort', 'fields', 'search',
    'status', 'type', 'startDate', 'endDate'
  ]
});

// CORS Middleware
const corsMiddleware = (req, res, next) => {
  res.header('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
};

// Input sanitization middleware
const sanitizeInput = (req, res, next) => {
  try {
    // Sanitize query parameters
    for (let key in req.query) {
      if (typeof req.query[key] === 'string') {
        req.query[key] = req.query[key]
          .trim()
          .replace(/[<>]/g, '') // Remove < and >
          .substring(0, 1000); // Limit length
      }
    }

    // Sanitize body
    if (req.body && typeof req.body === 'object') {
      sanitizeObject(req.body);
    }

    next();
  } catch (error) {
    next(error);
  }
};

// Helper function to recursively sanitize objects
function sanitizeObject(obj) {
  for (let key in obj) {
    if (typeof obj[key] === 'string') {
      obj[key] = obj[key]
        .trim()
        .replace(/[<>]/g, '')
        .substring(0, 2000);
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      sanitizeObject(obj[key]);
    }
  }
}

// CSRF Protection Middleware
const csrfProtection = (req, res, next) => {
  // CSRF token validation for state-changing requests
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
    const csrfToken = req.headers['x-csrf-token'] || req.body?._csrf;
    
    // TODO: Validate CSRF token from session
    // For now, just log the intent
  }

  next();
};

module.exports = {
  securityHeaders,
  limiter,
  authLimiter,
  preventParameterPollution,
  corsMiddleware,
  sanitizeInput,
  csrfProtection
};
