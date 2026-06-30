// src/models/AuditLog.js
const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true
    },
    action: {
      type: String,
      required: true,
      enum: [
        'LOGIN', 'LOGOUT', 'REGISTER', 'PASSWORD_CHANGE', 'PASSWORD_RESET',
        'KYC_SUBMITTED', 'KYC_VERIFIED', 'WALLET_CREATED', 'MONEY_ADDED',
        'MONEY_TRANSFERRED', 'MONEY_RECEIVED', 'PAYMENT_MADE', 'DEVICE_ADDED',
        'DEVICE_REMOVED', 'PROFILE_UPDATED', '2FA_ENABLED', '2FA_DISABLED',
        'ACCOUNT_FROZEN', 'ACCOUNT_UNFROZEN', 'ACCOUNT_BANNED', 'ACCOUNT_REJECTED',
        'BANK_ADDED', 'BANK_UPDATED', 'BANK_DELETED', 'KYC_REJECTED',
        'BANK_DEFAULT_CHANGED',
        'TRANSACTION_PIN_CREATED', 'TRANSACTION_PIN_CHANGED', 'TRANSACTION_PIN_RESET_REQUESTED',
        'TRANSACTION_PIN_RESET', 'TRANSACTION_PIN_VERIFIED', 'TRANSACTION_PIN_FAILED',
        'TRANSACTION_PIN_LOCKED',
        'BENEFICIARY_ADDED', 'BENEFICIARY_UPDATED', 'BENEFICIARY_DELETED',
        'MONEY_REQUEST_CREATED', 'MONEY_REQUEST_ACCEPTED', 'MONEY_REQUEST_REJECTED',
        'SUPPORT_TICKET_CREATED', 'SUPPORT_TICKET_REPLIED', 'SUPPORT_TICKET_UPDATED',
        'NOMINEE_ADDED', 'NOMINEE_UPDATED', 'NOMINEE_DELETED',
        'EMERGENCY_CONTACT_ADDED', 'EMERGENCY_CONTACT_UPDATED', 'EMERGENCY_CONTACT_DELETED',
        'EMAIL_VERIFIED', 'ADMIN_ACTION'
      ]
    },
    resource: String,
    resourceId: String,
    changes: mongoose.Schema.Types.Mixed,
    ipAddress: String,
    userAgent: String,
    deviceFingerprint: String,
    status: {
      type: String,
      enum: ['SUCCESS', 'FAILURE'],
      default: 'SUCCESS'
    },
    statusMessage: String,
    severity: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      default: 'MEDIUM'
    },
    metadata: mongoose.Schema.Types.Mixed,
    createdAt: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  { timestamps: true, collection: 'auditLogs' }
);

// Indexes for efficient querying
auditLogSchema.index({ userId: 1, createdAt: -1 });
auditLogSchema.index({ action: 1 });
auditLogSchema.index({ severity: 1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
