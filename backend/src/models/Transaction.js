// src/models/Transaction.js
const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    transactionId: {
      type: String,
      unique: true,
      required: true,
      index: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    type: {
      type: String,
      enum: ['CREDIT', 'DEBIT', 'TRANSFER', 'WITHDRAWAL', 'DEPOSIT'],
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: [1, 'Amount must be greater than 0']
    },
    currency: {
      type: String,
      default: 'INR'
    },
    description: String,
    status: {
      type: String,
      enum: ['PENDING', 'SUCCESS', 'FAILED', 'CANCELLED'],
      default: 'PENDING'
    },

    // Transfer Details
    sender: {
      userId: mongoose.Schema.Types.ObjectId,
      firstName: String,
      lastName: String,
      email: String
    },
    receiver: {
      userId: mongoose.Schema.Types.ObjectId,
      firstName: String,
      lastName: String,
      email: String
    },

    // Payment Gateway
    paymentMethod: {
      type: String,
      enum: ['WALLET', 'RAZORPAY', 'BANK_TRANSFER', 'UPI'],
      default: 'WALLET'
    },
    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySignature: String,

    // Fraud Detection
    fraudScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    isFlagged: {
      type: Boolean,
      default: false
    },
    fraudReason: String,
    deviceFingerprint: String,
    geoLocation: {
      latitude: Number,
      longitude: Number,
      city: String,
      country: String
    },
    ipAddress: String,

    // Metadata
    walletAddress: String,
    reference: String,
    notes: String,
    metadata: mongoose.Schema.Types.Mixed,
    createdAt: {
      type: Date,
      default: Date.now,
      index: true
    },
    updatedAt: {
      type: Date,
      default: Date.now
    },
    completedAt: Date
  },
  { timestamps: true, collection: 'transactions' }
);

// Indexes for performance
transactionSchema.index({ userId: 1, createdAt: -1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ type: 1 });
transactionSchema.index({ createdAt: -1 });
transactionSchema.index({ isFlagged: 1 });

// Virtual for formatted amount
transactionSchema.virtual('formattedAmount').get(function() {
  return (this.amount / 100).toFixed(2);
});

module.exports = mongoose.model('Transaction', transactionSchema);
