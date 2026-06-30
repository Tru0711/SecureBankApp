const bcrypt = require('bcryptjs');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const { AppError } = require('./errorHandler');

const validatePinFormat = (pin) => {
  return /^\d{4,6}$/.test(String(pin || ''));
};

const verifyTransactionPin = async (userId, pin, context = {}) => {
  const auditFailure = async (message, severity = 'MEDIUM', action = 'TRANSACTION_PIN_FAILED') => {
    try {
      await AuditLog.create({
        userId,
        action,
        resource: 'TransactionPin',
        status: 'FAILURE',
        statusMessage: message,
        severity,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        deviceFingerprint: context.deviceFingerprint,
        changes: {
          operation: context.operation || 'PIN_VERIFY',
          attemptsRemaining: context.attemptsRemaining,
          lockedUntil: context.lockedUntil
        }
      });
    } catch (auditError) {
      // Do not block the protected operation on audit persistence issues.
    }
  };

  if (!validatePinFormat(pin)) {
    await auditFailure('Invalid transaction PIN format', 'LOW');
    throw new AppError('Transaction PIN must be 4 to 6 digits', 400);
  }

  const user = await User.findById(userId).select('+transactionPin');
  if (!user || !user.transactionPin) {
    await auditFailure('Transaction PIN is not set', 'MEDIUM');
    throw new AppError('Transaction PIN is not set', 403);
  }

  if (user.transactionPinLockedUntil && user.transactionPinLockedUntil > Date.now()) {
    const minutesLeft = Math.ceil((user.transactionPinLockedUntil - Date.now()) / (60 * 1000));
    context.lockedUntil = user.transactionPinLockedUntil;
    await auditFailure('Transaction PIN is locked', 'HIGH', 'TRANSACTION_PIN_LOCKED');
    throw new AppError(`Transaction PIN is locked. Please try again in ${minutesLeft} minute(s).`, 429);
  }

  const valid = await bcrypt.compare(String(pin), user.transactionPin);
  if (!valid) {
    user.transactionPinAttempts = (user.transactionPinAttempts || 0) + 1;
    if (user.transactionPinAttempts >= 5) {
      user.transactionPinLockedUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
      user.transactionPinAttempts = 0;
      await user.save();
      context.lockedUntil = user.transactionPinLockedUntil;
      await auditFailure('Too many incorrect attempts. Transaction PIN locked.', 'HIGH', 'TRANSACTION_PIN_LOCKED');
      throw new AppError('Too many incorrect attempts. Transaction PIN has been locked for 15 minutes.', 429);
    }
    await user.save();
    const attemptsRemaining = 5 - user.transactionPinAttempts;
    context.attemptsRemaining = attemptsRemaining;
    await auditFailure(`Invalid transaction PIN. ${attemptsRemaining} attempt(s) remaining.`, 'MEDIUM');
    throw new AppError(`Invalid transaction PIN. ${attemptsRemaining} attempt(s) remaining.`, 403);
  }

  if (user.transactionPinAttempts > 0 || user.transactionPinLockedUntil) {
    user.transactionPinAttempts = 0;
    user.transactionPinLockedUntil = undefined;
    await user.save();
  }

  return true;
};

module.exports = {
  validatePinFormat,
  verifyTransactionPin
};
