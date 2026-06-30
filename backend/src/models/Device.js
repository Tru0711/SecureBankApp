// src/models/Device.js
const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    deviceFingerprint: {
      type: String,
      unique: true,
      required: true
    },
    deviceName: String,
    deviceType: {
      type: String,
      enum: ['MOBILE', 'TABLET', 'DESKTOP', 'OTHER'],
      default: 'DESKTOP'
    },
    osType: {
      type: String,
      enum: ['ANDROID', 'IOS', 'WINDOWS', 'MAC', 'LINUX', 'OTHER'],
      default: 'OTHER'
    },
    osVersion: String,
    browserName: String,
    browserVersion: String,
    appVersion: String,
    ipAddress: {
      type: String,
      index: true
    },
    geoLocation: {
      latitude: Number,
      longitude: Number,
      city: String,
      state: String,
      country: String,
      timezone: String
    },
    isTrusted: {
      type: Boolean,
      default: false
    },
    isBlocked: {
      type: Boolean,
      default: false
    },
    lastUsedAt: {
      type: Date,
      default: Date.now
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true, collection: 'devices' }
);

// Index for efficient lookup
deviceSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Device', deviceSchema);
