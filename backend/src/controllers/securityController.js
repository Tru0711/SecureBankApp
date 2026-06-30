const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Session = require('../models/Session');
const Device = require('../models/Device');
const Notification = require('../models/Notification');
const Transaction = require('../models/Transaction');
const AuditLog = require('../models/AuditLog');
const { AppError } = require('../utils/errorHandler');
const { validatePinFormat, verifyTransactionPin } = require('../utils/transactionPin');

const auditContext = (req, operation) => ({
  operation,
  ipAddress: req.ip,
  userAgent: req.get('user-agent'),
  deviceFingerprint: req.body?.deviceFingerprint
});

const publicSession = (session) => ({
  _id: session._id,
  deviceId: session.deviceId,
  deviceFingerprint: session.deviceFingerprint,
  ipAddress: session.ipAddress,
  userAgent: session.userAgent,
  browser: parseBrowser(session.userAgent),
  isActive: session.isActive,
  loginTime: session.createdAt,
  logoutAt: session.logoutAt,
  expiresAt: session.expiresAt
});

const parseBrowser = (userAgent = '') => {
  if (userAgent.includes('Edg/')) return 'Edge';
  if (userAgent.includes('Chrome/')) return 'Chrome';
  if (userAgent.includes('Firefox/')) return 'Firefox';
  if (userAgent.includes('Safari/')) return 'Safari';
  return 'Unknown';
};

class SecurityController {
  async getOverview(req, res, next) {
    try {
      const [user, activeSessions, alerts, fraudAlerts] = await Promise.all([
        User.findById(req.user.id),
        Session.find({ userId: req.user.id, isActive: true }).sort({ createdAt: -1 }).select('-token -refreshToken'),
        Notification.find({ userId: req.user.id, type: { $in: ['SECURITY', 'FRAUD_ALERT'] } }).sort({ createdAt: -1 }).limit(10),
        Transaction.find({ userId: req.user.id, isFlagged: true }).sort({ createdAt: -1 }).limit(10)
      ]);

      res.status(200).json({
        success: true,
        data: {
          hasTransactionPin: Boolean(user.transactionPinSetAt),
          activeDeviceCount: activeSessions.length,
          securityAlerts: alerts,
          fraudAlerts
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async createPin(req, res, next) {
    try {
      const { pin, confirmPin } = req.body;
      if (!validatePinFormat(pin)) throw new AppError('Transaction PIN must be 4 to 6 digits', 400);
      if (pin !== confirmPin) throw new AppError('PINs do not match', 400);

      const user = await User.findById(req.user.id).select('+transactionPin');
      if (user.transactionPin) throw new AppError('Transaction PIN already exists', 409);

      user.transactionPin = await bcrypt.hash(String(pin), 10);
      user.transactionPinSetAt = new Date();
      await user.save();

      await AuditLog.create({
        userId: req.user.id,
        action: 'TRANSACTION_PIN_CREATED',
        resource: 'TransactionPin',
        status: 'SUCCESS',
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });
      res.status(201).json({ success: true, message: 'Transaction PIN created' });
    } catch (error) {
      next(error);
    }
  }

  async updatePin(req, res, next) {
    try {
      const { currentPin, newPin, confirmPin } = req.body;
      await verifyTransactionPin(req.user.id, currentPin, auditContext(req, 'PIN_CHANGE'));
      if (!validatePinFormat(newPin)) throw new AppError('Transaction PIN must be 4 to 6 digits', 400);
      if (newPin !== confirmPin) throw new AppError('PINs do not match', 400);

      const user = await User.findById(req.user.id).select('+transactionPin');
      user.transactionPin = await bcrypt.hash(String(newPin), 10);
      user.transactionPinUpdatedAt = new Date();
      await user.save();

      await AuditLog.create({
        userId: req.user.id,
        action: 'TRANSACTION_PIN_CHANGED',
        resource: 'TransactionPin',
        status: 'SUCCESS',
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });
      res.status(200).json({ success: true, message: 'Transaction PIN updated' });
    } catch (error) {
      next(error);
    }
  }

  async verifyPin(req, res, next) {
    try {
      await verifyTransactionPin(req.user.id, req.body.pin, auditContext(req, 'PIN_VERIFY'));
      await AuditLog.create({
        userId: req.user.id,
        action: 'TRANSACTION_PIN_VERIFIED',
        resource: 'TransactionPin',
        status: 'SUCCESS',
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });
      res.status(200).json({ success: true, message: 'Transaction PIN verified' });
    } catch (error) {
      next(error);
    }
  }

  async forgotPin(req, res, next) {
    try {
      const AuthService = require('../services/authService');
      const user = await User.findById(req.user.id);
      if (!user) throw new AppError('User not found', 404);

      await AuthService.sendOTP(user.email, 'TRANSACTION');
      await AuditLog.create({
        userId: user._id,
        action: 'TRANSACTION_PIN_RESET_REQUESTED',
        resource: 'TransactionPin',
        status: 'SUCCESS',
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });
      res.status(200).json({ success: true, message: 'OTP sent to your registered email address.' });
    } catch (error) {
      next(error);
    }
  }

  async resetPin(req, res, next) {
    try {
      const { otp, newPin, confirmPin } = req.body;
      const { validatePinFormat } = require('../utils/transactionPin');
      if (!validatePinFormat(newPin)) throw new AppError('Transaction PIN must be 4 to 6 digits', 400);
      if (newPin !== confirmPin) throw new AppError('PINs do not match', 400);

      const AuthService = require('../services/authService');
      const user = await User.findById(req.user.id);
      if (!user) throw new AppError('User not found', 404);

      await AuthService.verifyOtp(user.email, otp, 'TRANSACTION');

      user.transactionPin = await bcrypt.hash(String(newPin), 10);
      user.transactionPinSetAt = new Date();
      user.transactionPinUpdatedAt = new Date();
      user.transactionPinAttempts = 0;
      user.transactionPinLockedUntil = undefined;
      await user.save();

      await AuditLog.create({
        userId: user._id,
        action: 'TRANSACTION_PIN_RESET',
        resource: 'TransactionPin',
        status: 'SUCCESS',
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        changes: { operation: 'PIN_RESET', status: 'SUCCESS' }
      });

      res.status(200).json({ success: true, message: 'Transaction PIN reset successfully' });
    } catch (error) {
      next(error);
    }
  }

  async getLoginHistory(req, res, next) {
    try {
      const sessions = await Session.find({ userId: req.user.id }).sort({ createdAt: -1 }).limit(50).select('-token -refreshToken');
      res.status(200).json({ success: true, data: { items: sessions.map(publicSession) } });
    } catch (error) {
      next(error);
    }
  }

  async getSecurityLogs(req, res, next) {
    try {
      const logs = await AuditLog.find({
        userId: req.user.id,
        $or: [
          { action: { $in: [
            'PASSWORD_CHANGE', 'PASSWORD_RESET', '2FA_ENABLED', '2FA_DISABLED',
            'BANK_ADDED', 'BANK_UPDATED', 'BANK_DELETED', 'BANK_DEFAULT_CHANGED',
            'TRANSACTION_PIN_CREATED', 'TRANSACTION_PIN_CHANGED', 'TRANSACTION_PIN_RESET_REQUESTED',
            'TRANSACTION_PIN_RESET', 'TRANSACTION_PIN_VERIFIED', 'TRANSACTION_PIN_FAILED',
            'TRANSACTION_PIN_LOCKED', 'ADMIN_ACTION'
          ] } },
          { action: 'LOGIN', status: 'FAILURE' }
        ]
      }).sort({ createdAt: -1 }).limit(50);
      
      res.status(200).json({ success: true, data: { items: logs } });
    } catch (error) {
      next(error);
    }
  }

  async getDevices(req, res, next) {
    try {
      const [sessions, devices] = await Promise.all([
        Session.find({ userId: req.user.id }).sort({ createdAt: -1 }).limit(50).select('-token -refreshToken'),
        Device.find({ userId: req.user.id }).sort({ lastUsedAt: -1 })
      ]);
      const deviceMap = new Map(devices.map((device) => [device._id.toString(), device]));
      res.status(200).json({
        success: true,
        data: {
          items: sessions.map((session) => ({
            ...publicSession(session),
            device: session.deviceId ? deviceMap.get(session.deviceId.toString()) || null : null
          }))
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async logoutDevice(req, res, next) {
    try {
      const session = await Session.findOneAndUpdate(
        { _id: req.params.sessionId, userId: req.user.id },
        { $set: { isActive: false, logoutAt: new Date() } },
        { new: true }
      );
      if (!session) throw new AppError('Device session not found', 404);

      await AuditLog.create({
        userId: req.user.id,
        action: 'LOGOUT',
        resource: 'Session',
        resourceId: session._id.toString(),
        status: 'SUCCESS'
      });

      res.status(200).json({ success: true, message: 'Device logged out' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new SecurityController();
