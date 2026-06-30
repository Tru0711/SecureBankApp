// src/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    // Basic Information
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      minlength: [2, 'First name must be at least 2 characters'],
      maxlength: [50, 'First name cannot exceed 50 characters']
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      minlength: [2, 'Last name must be at least 2 characters'],
      maxlength: [50, 'Last name cannot exceed 50 characters']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      unique: true,
      match: [/^[6-9]\d{9}$/, 'Please provide a valid Indian phone number']
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false
    },
    dateOfBirth: {
      type: Date,
      required: true,
      validate: {
        validator: function (v) {
          return v <= new Date(Date.now() - 567648000000); // 18 years
        },
        message: 'User must be at least 18 years old'
      }
    },

    // KYC Information
    kycStatus: {
      type: String,
      enum: ['PENDING', 'LEVEL_1_VERIFIED', 'LEVEL_2_VERIFIED', 'REJECTED'],
      default: 'PENDING'
    },
    kycDocuments: {
      panCard: {
        documentNumber: String,
        uploadedAt: Date,
        verified: { type: Boolean, default: false }
      },
      aadhar: {
        documentNumber: String,
        uploadedAt: Date,
        verified: { type: Boolean, default: false }
      },
      bankAccount: {
        accountNumber: String,
        ifscCode: String,
        accountHolderName: String,
        verified: { type: Boolean, default: false }
      }
    },

    // Account Status (Phase 1 scaffolding)
    // Superset enum to avoid breaking existing routes/users.
    accountStatus: {
      type: String,
      enum: [
        'EMAIL_PENDING',
        'PROFILE_INCOMPLETE',
        'BANK_DETAILS_PENDING',
        'KYC_PENDING',
        'ADMIN_REVIEW_PENDING',
        'ACTIVE',
        // Backward compatibility
        'RESTRICTED',
        'FROZEN',
        'BANNED',
        'REJECTED',
        'SUSPENDED',
        'CLOSED'
      ],
      default: 'EMAIL_PENDING'
    },
    accountStatusReason: String,
    accountStatusUpdatedAt: Date,
    accountStatusUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },

    // Keep existing verification flags for backward compatibility
    isEmailVerified: {
      type: Boolean,
      default: false
    },
    isPhoneVerified: {
      type: Boolean,
      default: false
    },

    // Security
    twoFactorEnabled: {
      type: Boolean,
      default: false
    },
    twoFactorSecret: String,
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    loginAttempts: {
      type: Number,
      default: 0
    },
    accountLockedUntil: Date,
    transactionPin: {
      type: String,
      select: false
    },
    transactionPinSetAt: Date,
    transactionPinUpdatedAt: Date,
    transactionPinAttempts: {
      type: Number,
      default: 0
    },
    transactionPinLockedUntil: Date,

    // User Role
    role: {
      type: String,
      enum: ['USER', 'PREMIUM', 'ADMIN', 'ANALYST', 'KYC_OFFICER'],
      default: 'USER'
    },

    // Profile Information
    profilePicture: String,
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: { type: String, default: 'IN' }
    },
    occupation: String,
    gender: {
      type: String,
      enum: ['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']
    },
    annualIncome: Number,
    panNumber: String,
    aadhaarNumber: String,
    sourceOfIncome: String,
    profileCompletedAt: Date,

    // Preferences
    notificationPreferences: {
      emailNotifications: { type: Boolean, default: true },
      pushNotifications: { type: Boolean, default: true },
      smsNotifications: { type: Boolean, default: false }
    },
    language: { type: String, default: 'en' },
    timezone: { type: String, default: 'Asia/Kolkata' },

    // Metadata
    lastLogin: Date,
    lastLoginIP: String,
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true, collection: 'users' }
);

// Indexes for performance
userSchema.index({ email: 1 });
userSchema.index({ phone: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ accountStatus: 1 });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS) || 12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Get user public profile (exclude sensitive data)
userSchema.methods.getPublicProfile = function () {
  const user = this.toObject();
  delete user.password;
  delete user.passwordResetToken;
  delete user.passwordResetExpires;
  delete user.twoFactorSecret;
  delete user.transactionPin;
  user.hasTransactionPin = Boolean(this.transactionPinSetAt);
  return user;
};

// Check if account is locked
userSchema.methods.isAccountLocked = function () {
  return this.accountLockedUntil && this.accountLockedUntil > Date.now();
};

module.exports = mongoose.model('User', userSchema);
