const express = require('express');
const router = express.Router();

const User = require('../models/User');

/**
 * Dev-only debug endpoint for bootstrap/admin existence.
 * NEVER expose publicly in production.
 */
router.get('/bootstrap-status', async (req, res, next) => {
  try {
    const anyAdmin = await User.findOne({ role: 'ADMIN' }).select('email phone accountStatus isEmailVerified').lean();
    const hasAdmin = Boolean(anyAdmin);

    res.status(200).json({
      success: true,
      data: {
        hasAdmin,
        admin: anyAdmin || null
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

