// src/services/authService.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Session = require('../models/Session');
const Device = require('../models/Device');
const AuditLog = require('../models/AuditLog');
const Otp = require('../models/Otp');
const NotificationService = require('./notificationService');
const { AppError } = require('../utils/errorHandler');
const { STATUSES } = require('../utils/userStatus');

class AuthService {
  // Generate JWT Token
  generateToken(userId, expiresIn = process.env.JWT_EXPIRE || '15m') {
    return jwt.sign(
      { id: userId },
      process.env.JWT_SECRET,
      { expiresIn }
    );
  }

  // Generate Refresh Token
  generateRefreshToken(userId, expiresIn = process.env.JWT_REFRESH_EXPIRE || '7d') {
    return jwt.sign(
      { id: userId, type: 'refresh' },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn }
    );
  }

  // Verify Token
  verifyToken(token, isRefresh = false) {
    try {
      const secret = isRefresh ? process.env.JWT_REFRESH_SECRET : process.env.JWT_SECRET;
      return jwt.verify(token, secret);
    } catch (error) {
      throw new AppError('Invalid or expired token', 401);
    }
  }

  // Register User
  async registerUser(userData) {
    try {
      // Check if user already exists
      const existingUser = await User.findOne({
        $or: [{ email: userData.email }, { phone: userData.phone }]
      });

      if (existingUser) {
        throw new AppError('User already exists with this email or phone', 409);
      }

      // Create new user
      const user = await User.create({
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        phone: userData.phone,
        password: userData.password,
        dateOfBirth: userData.dateOfBirth
      });

      // Create wallet
      const Wallet = require('../models/Wallet');
      await Wallet.create({ userId: user._id });

      // Log action
      await AuditLog.create({
        userId: user._id,
        action: 'REGISTER',
        status: 'SUCCESS',
        ipAddress: userData.ipAddress
      });

      // Send Mongo-backed verification OTP
      await this.createAndSendOtp(user, 'EMAIL_VERIFICATION');

      return user.getPublicProfile();
    } catch (error) {
      throw error;
    }
  }

  // Login User
  async loginUser(email, password, deviceData) {
    try {
      // Find user by email
      const user = await User.findOne({ email }).select('+password');

      if (!user) {
        throw new AppError('Invalid email or password', 401);
      }

      // Check account status
      if (user.accountStatus === 'FROZEN' || user.accountStatus === 'SUSPENDED') {
        throw new AppError(`Account is ${user.accountStatus}`, 403);
      }

      if (!user.isEmailVerified || user.accountStatus === STATUSES.EMAIL_PENDING) {
        throw new AppError('Please verify your email before logging in', 403);
      }

      // Check if account is locked
      if (user.isAccountLocked()) {
        throw new AppError('Account is temporarily locked. Please try again later', 429);
      }

      // Verify password
      const isPasswordCorrect = await user.comparePassword(password);

      if (!isPasswordCorrect) {
        // Increment login attempts
        user.loginAttempts = (user.loginAttempts || 0) + 1;
        
        // Lock account after 5 failed attempts
        if (user.loginAttempts >= 5) {
          user.accountLockedUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
          user.loginAttempts = 0;
        }

        await user.save();

        await AuditLog.create({
          userId: user._id,
          action: 'LOGIN',
          status: 'FAILURE',
          statusMessage: 'Invalid password',
          ipAddress: deviceData.ipAddress,
          severity: 'MEDIUM'
        });

        throw new AppError('Invalid email or password', 401);
      }

      // Reset login attempts on successful login
      user.loginAttempts = 0;
      user.lastLogin = new Date();
      user.lastLoginIP = deviceData.ipAddress;
      await user.save();

      // Track device
      let device = await Device.findOne({ deviceFingerprint: deviceData.fingerprint });
      if (!device) {
        device = await Device.create({
          userId: user._id,
          deviceFingerprint: deviceData.fingerprint,
          ...deviceData
        });
      } else {
        device.lastUsedAt = new Date();
        await device.save();
      }

      // Generate tokens
      const accessToken = this.generateToken(user._id);
      const refreshToken = this.generateRefreshToken(user._id);

      // Create session
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
      await Session.create({
        userId: user._id,
        token: accessToken,
        refreshToken,
        deviceId: device._id,
        deviceFingerprint: device.deviceFingerprint,
        ipAddress: deviceData.ipAddress,
        userAgent: deviceData.userAgent,
        expiresAt
      });

      // Log successful login
      await AuditLog.create({
        userId: user._id,
        action: 'LOGIN',
        status: 'SUCCESS',
        ipAddress: deviceData.ipAddress
      });

      return {
        user: user.getPublicProfile(),
        accessToken,
        refreshToken,
        expiresIn: '15m'
      };
    } catch (error) {
      throw error;
    }
  }

  // Refresh Token
  async refreshAccessToken(refreshToken) {
    try {
      // Verify refresh token
      const decoded = this.verifyToken(refreshToken, true);

      // Find session
      const session = await Session.findOne({
        userId: decoded.id,
        refreshToken,
        isActive: true
      });

      if (!session) {
        throw new AppError('Invalid refresh token', 401);
      }

      // Generate new access token
      const newAccessToken = this.generateToken(decoded.id);

      // Update session
      session.token = newAccessToken;
      session.expiresAt = new Date(Date.now() + 15 * 60 * 1000);
      await session.save();

      return {
        accessToken: newAccessToken,
        expiresIn: '15m'
      };
    } catch (error) {
      throw error;
    }
  }

  // Logout User
  async logoutUser(userId, token) {
    try {
      // Update session status
      await Session.updateOne(
        { userId, token },
        { isActive: false, logoutAt: new Date() }
      );

      // Log action
      await AuditLog.create({
        userId,
        action: 'LOGOUT',
        status: 'SUCCESS'
      });

      return { message: 'Logged out successfully' };
    } catch (error) {
      throw error;
    }
  }

  // Request Password Reset
  async requestPasswordReset(email) {
    try {
      const user = await User.findOne({ email });

      if (!user) {
        throw new AppError('User not found', 404);
      }

      // Generate reset token
      const resetToken = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      // Save reset token to database
      user.passwordResetToken = resetToken;
      user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
      await user.save();

      // Send reset email
      await NotificationService.sendPasswordResetEmail(user, resetToken);

      return { message: 'Password reset link sent to email' };
    } catch (error) {
      throw error;
    }
  }

  // Reset Password
  async resetPassword(resetToken, newPassword) {
    try {
      // Verify token
      const decoded = this.verifyToken(resetToken);

      // Find user
      const user = await User.findById(decoded.id);

      if (!user || user.passwordResetToken !== resetToken) {
        throw new AppError('Invalid reset token', 401);
      }

      if (user.passwordResetExpires < Date.now()) {
        throw new AppError('Reset token has expired', 401);
      }

      // Update password
      user.password = newPassword;
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      user.passwordChangedAt = new Date();
      await user.save();

      // Log action
      await AuditLog.create({
        userId: user._id,
        action: 'PASSWORD_RESET',
        status: 'SUCCESS'
      });

      return { message: 'Password reset successfully' };
    } catch (error) {
      throw error;
    }
  }

  async createAndSendOtp(user, type = 'EMAIL_VERIFICATION', resend = false) {
    const cooldownSeconds = Number(process.env.OTP_RESEND_COOLDOWN_SECONDS || 60);
    const expirySeconds = Number(process.env.OTP_EXPIRY || 600);

    const latestOtp = await Otp.findOne({
      userId: user._id,
      email: user.email,
      type,
      verified: false
    }).sort({ createdAt: -1 });

    if (resend && latestOtp && Date.now() - latestOtp.createdAt.getTime() < cooldownSeconds * 1000) {
      throw new AppError(`Please wait ${cooldownSeconds} seconds before requesting another OTP`, 429);
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await bcrypt.hash(otp, 10);

    await Otp.deleteMany({ userId: user._id, email: user.email, type, verified: false });
    await Otp.create({
      userId: user._id,
      email: user.email,
      otp: hashedOtp,
      expiresAt: new Date(Date.now() + expirySeconds * 1000),
      attempts: 0,
      verified: false,
      type
    });

    await NotificationService.sendOTPEmail(user, otp);
    return { message: 'OTP sent successfully' };
  }

  async verifyOtp(email, otp, type = 'EMAIL_VERIFICATION') {
    const user = await User.findOne({ email });
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const otpRecord = await Otp.findOne({
      userId: user._id,
      email: user.email,
      type,
      verified: false
    }).sort({ createdAt: -1 });

    if (!otpRecord) {
      throw new AppError('OTP not found or already used', 400);
    }

    if (otpRecord.expiresAt < new Date()) {
      throw new AppError('OTP has expired', 400);
    }

    const maxAttempts = Number(process.env.OTP_MAX_ATTEMPTS || 5);
    if (otpRecord.attempts >= maxAttempts) {
      throw new AppError('Maximum OTP attempts exceeded', 429);
    }

    const validOtp = await bcrypt.compare(otp, otpRecord.otp);
    if (!validOtp) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      await AuditLog.create({
        userId: user._id,
        action: type === 'TRANSACTION' ? 'TRANSACTION_PIN_FAILED' : 'EMAIL_VERIFIED',
        resource: type === 'TRANSACTION' ? 'TransactionPin' : 'Otp',
        status: 'FAILURE',
        statusMessage: 'Invalid OTP',
        severity: type === 'TRANSACTION' ? 'MEDIUM' : 'LOW'
      });
      throw new AppError('Invalid OTP', 400);
    }

    otpRecord.verified = true;
    otpRecord.type = type;
    await otpRecord.save();

    if (type === 'EMAIL_VERIFICATION') {
      user.isEmailVerified = true;
      if (user.accountStatus === STATUSES.EMAIL_PENDING) {
        user.accountStatus = STATUSES.PROFILE_INCOMPLETE;
      }
      await user.save();
    }

    await AuditLog.create({
      userId: user._id,
      action: 'EMAIL_VERIFIED',
      status: 'SUCCESS'
    });

    return {
      user: user.getPublicProfile(),
      message: 'OTP verified successfully'
    };
  }

  // Verify Email
  async verifyEmail(userId, otp) {
    try {
      const user = await User.findById(userId);

      if (!user) {
        throw new AppError('User not found', 404);
      }

      return await this.verifyOtp(user.email, otp, 'EMAIL_VERIFICATION');
    } catch (error) {
      throw error;
    }
  }

  // Send OTP
  async sendOTP(email, type = 'EMAIL_VERIFICATION', resend = false) {
    try {
      const user = await User.findOne({ email });

      if (!user) {
        throw new AppError('User not found', 404);
      }

      return await this.createAndSendOtp(user, type, resend);
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new AuthService();
