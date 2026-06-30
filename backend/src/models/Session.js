// src/models/Session.js
const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    token: {
      type: String,
      required: true,
      index: true
    },
    refreshToken: String,
    deviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Device'
    },
    deviceFingerprint: String,
    ipAddress: String,
    userAgent: String,
    isActive: {
      type: Boolean,
      default: true
    },
    expiresAt: {
      type: Date,
      required: true
    },
    logoutAt: Date,
    createdAt: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  { timestamps: true, collection: 'sessions' }
);

// Set TTL index for automatic deletion after expiration
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Session', sessionSchema);
