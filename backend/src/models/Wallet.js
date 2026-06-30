// src/models/Wallet.js
const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true
    },
    walletAddress: {
      type: String,
      unique: true,
      sparse: true
    },
    balance: {
      type: Number,
      default: 0,
      min: [0, 'Balance cannot be negative']
    },
    lockedAmount: {
      type: Number,
      default: 0,
      min: [0, 'Locked amount cannot be negative']
    },
    availableBalance: {
      type: Number,
      default: 0
    },
    currency: {
      type: String,
      default: 'INR',
      enum: ['INR', 'USD']
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'SUSPENDED', 'FROZEN'],
      default: 'ACTIVE'
    },
    totalIncome: {
      type: Number,
      default: 0
    },
    totalExpense: {
      type: Number,
      default: 0
    },
    totalTransfers: {
      type: Number,
      default: 0
    },
    dailySpent: {
      type: Number,
      default: 0
    },
    monthlySpent: {
      type: Number,
      default: 0
    },
    lastSpentDate: Date,
    lastSpentMonth: String,
    isVerified: {
      type: Boolean,
      default: false
    },
    verificationDate: Date,
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true, collection: 'wallets' }
);

// Update available balance before saving
walletSchema.pre('save', function(next) {
  this.availableBalance = this.balance - this.lockedAmount;
  next();
});

// Virtual for formatted balance
walletSchema.virtual('formattedBalance').get(function() {
  return (this.balance / 100).toFixed(2);
});

module.exports = mongoose.model('Wallet', walletSchema);
