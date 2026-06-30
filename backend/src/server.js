// src/server.js
require('dotenv').config();
const express = require('express');
const connectDB = require('./config/database');
const adminBootstrap = require('./bootstrap/adminBootstrap');

// Import middleware

const {
  securityHeaders,
  limiter,
  preventParameterPollution,
  corsMiddleware,
  sanitizeInput
} = require('./middleware/securityMiddleware');
const {
  errorHandler,
  notFound
} = require('./middleware/errorMiddleware');



// Import routes

const authRoutes = require('./routes/authRoutes');
const walletRoutes = require('./routes/walletRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();


// ============================================
// MIDDLEWARE SETUP
// ============================================

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Security middleware
app.use(securityHeaders);
app.use(corsMiddleware);
// Apply general rate limiter after authLimiter is used for /api/v1/auth routes.
app.use(limiter);
app.use(preventParameterPollution);
app.use(sanitizeInput);


// ============================================
// HEALTH CHECK ROUTE
// ============================================

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'SecurePay NeoBank Backend is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// ============================================
// API ROUTES
// ============================================

// Authentication routes
app.use('/api/v1/auth', authRoutes);

// Wallet routes
app.use('/api/v1/wallet', walletRoutes);

// User onboarding/profile routes
app.use('/api/v1/users', userRoutes);

// Serve uploaded KYC documents (local filesystem)
const path = require('path');
app.use('/api/v1/uploads', express.static(path.join(__dirname, '../..', 'uploads')));


// Notifications routes
const notificationsRoutes = require('./routes/notificationsRoutes');
app.use('/api/v1/notifications', notificationsRoutes);

// Admin routes
const adminRoutes = require('./routes/adminRoutes');
app.use('/api/v1/admin', adminRoutes);

// Dev-only bootstrap debug routes (no auth). Remove/disable in production.
const adminBootstrapRoutes = require('./routes/adminBootstrapRoutes');
app.use('/api/v1/admin', adminBootstrapRoutes);


// Fraud routes
const fraudRoutes = require('./routes/fraudRoutes');
app.use('/api/v1/fraud', fraudRoutes);






// ============================================
// ERROR HANDLING
// ============================================

// 404 Not Found
app.use(notFound);

// Global error handler
app.use(errorHandler);

// ============================================
// SERVER INITIALIZATION
// ============================================

const PORT = Number(process.env.PORT || 5000);
// Bind explicitly to both IPv4 and IPv6 localhost where possible
// Use 127.0.0.1 by default to avoid IPv6-only edge cases in some tooling
const HOST = process.env.HOST || '127.0.0.1';

// Validate critical auth configuration early (fail fast)
const requiredEnv = [
  'MONGODB_URI',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET'
];
for (const key of requiredEnv) {
  if (!process.env[key]) {
    console.error(`[config error] Missing environment variable: ${key}`);
    process.exit(1);
  }
}

const startServer = async () => {
  // Early log to confirm startup flow reached startServer
  console.log('startServer() entered. PID=', process.pid);
  try {
    // Connect to database
    await connectDB();



    // One-time bootstrap (creates initial ADMIN if none exists)
    await adminBootstrap();

    // Start server
    console.log('Starting HTTP server with config:', { HOST, PORT, PID: process.pid });
    const server = app.listen(PORT, HOST);


    server.on('listening', () => {
      console.log(`
╔═══════════════════════════════════════════════════════════╗
║   SecurePay NeoBank - Backend Server                      ║
║   Status: RUNNING ✓                                       ║
║   URL: http://${HOST}:${PORT}                            ║
║   Environment: ${process.env.NODE_ENV}                       ║
║   Database: ${process.env.MONGODB_URI.substring(0, 40)}... ║
╚═══════════════════════════════════════════════════════════╝
      `);
    });

    server.on('error', (err) => {
      console.error('HTTP server listen error:', err);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM signal received: closing HTTP server');
      server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      console.log('SIGINT signal received: closing HTTP server');
      server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
      });
    });

    // Uncaught exception handler
    process.on('uncaughtException', (err) => {
      console.error('Uncaught Exception:', err);
      process.exit(1);
    });

    // Unhandled rejection handler
    process.on('unhandledRejection', (reason, promise) => {
      console.error('Unhandled Rejection at:', promise, 'reason:', reason);
      process.exit(1);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
