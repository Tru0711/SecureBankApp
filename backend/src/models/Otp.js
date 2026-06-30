const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    email: {
      type: String,
      required: true,
      index: true
    },
    otp: {
      type: String,
      required: true,
      index: true
    },
    type: {
      type: String,
      enum: ['EMAIL_VERIFICATION', 'LOGIN', 'PASSWORD_RESET', 'TRANSACTION'],
      default: 'EMAIL_VERIFICATION'
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true
    },
    attempts: {
      type: Number,
      default: 0
    },
    verified: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

// TTL cleanup (MongoDB will delete expired docs automatically)
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Otp', otpSchema);
