// src/models/Notification.js
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    type: {
      type: String,
      enum: ['TRANSACTION', 'SECURITY', 'KYC', 'PROMOTIONAL', 'ACCOUNT', 'FRAUD_ALERT'],
      required: true
    },
    title: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    description: String,
    transactionId: mongoose.Schema.Types.ObjectId,
    channel: {
      type: [String],
      enum: ['EMAIL', 'PUSH', 'IN_APP', 'SMS'],
      default: ['IN_APP']
    },
    status: {
      type: String,
      enum: ['SENT', 'DELIVERED', 'READ', 'FAILED'],
      default: 'SENT'
    },
    isRead: {
      type: Boolean,
      default: false
    },
    readAt: Date,
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
      default: 'MEDIUM'
    },
    actionUrl: String,
    metadata: mongoose.Schema.Types.Mixed,
    failureReason: String,
    createdAt: {
      type: Date,
      default: Date.now,
      index: true
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    }
  },
  { timestamps: true, collection: 'notifications' }
);

// Set TTL index for automatic deletion after expiration
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ isRead: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
