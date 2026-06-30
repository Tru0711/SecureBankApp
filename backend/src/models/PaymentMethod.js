// src/models/PaymentMethod.js
const mongoose = require('mongoose');

const paymentMethodSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    type: {
      type: String,
      enum: ['BANK_ACCOUNT', 'UPI', 'CREDIT_CARD', 'DEBIT_CARD'],
      required: true
    },
    isDefault: {
      type: Boolean,
      default: false
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE', 'EXPIRED'],
      default: 'ACTIVE'
    },

    // Bank Account Details
    bankDetails: {
      accountHolderName: String,
      accountNumber: String,
      ifscCode: String,
      bankName: String,
      accountType: {
        type: String,
        enum: ['SAVINGS', 'CURRENT']
      },
      isVerified: Boolean
    },

    // UPI Details
    upiDetails: {
      upiId: String,
      isVerified: Boolean
    },

    // Card Details (encrypted in production)
    cardDetails: {
      cardHolderName: String,
      cardLastFourDigits: String,
      expiryMonth: String,
      expiryYear: String,
      cardBrand: {
        type: String,
        enum: ['VISA', 'MASTERCARD', 'AMEX', 'RUPAY']
      },
      isVerified: Boolean
    },

    metadata: mongoose.Schema.Types.Mixed,
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true, collection: 'paymentMethods' }
);

paymentMethodSchema.index({ userId: 1 });

module.exports = mongoose.model('PaymentMethod', paymentMethodSchema);
