const { AppError } = require('../utils/errorHandler');
const { STATUSES, isTerminalBlocked } = require('../utils/userStatus');

/**
 * Reusable middleware only.
 * Phase 1:
 * - requireEmailVerified: blocks login for EMAIL_PENDING (and anything not verified yet)
 * - requireActiveAccount: blocks any protected financial access for non-ACTIVE / terminal blocked
 * - statusGuard: generic guard for any allowed statuses (used by later phases)
 */

const requireEmailVerified = (req, res, next) => {
  try {
    const user = req.user;
    if (!user) throw new AppError('Unauthorized', 401);

    if (!user.isEmailVerified || user.accountStatus === STATUSES.EMAIL_PENDING) {
      throw new AppError('Please verify your email', 403);
    }

    return next();
  } catch (error) {
    next(error);
  }
};

const requireNotBanned = (req, res, next) => {
  try {
    const user = req.user;
    if (!user) throw new AppError('Unauthorized', 401);
    if (user.accountStatus === STATUSES.BANNED) {
      throw new AppError('Your account has been banned. Contact administrator.', 403);
    }
    return next();
  } catch (error) {
    next(error);
  }
};

const requireActiveAccount = (allowed = [STATUSES.ACTIVE]) => {
  return (req, res, next) => {
    try {
      const user = req.user;
      if (!user) throw new AppError('Unauthorized', 401);

      const status = user.accountStatus || STATUSES.EMAIL_PENDING;

      if (status === STATUSES.BANNED) {
        throw new AppError('Your account has been banned. Contact administrator.', 403);
      }

      if (!allowed.includes(status)) {
        const reason = user.accountStatusReason ? `: ${user.accountStatusReason}` : '';
        throw new AppError(`Account is not active${reason}`, 403);
      }

      return next();
    } catch (error) {
      next(error);
    }
  };
};

const statusGuard = (allowedStatuses) => {
  return (req, res, next) => {
    try {
      const user = req.user;
      if (!user) throw new AppError('Unauthorized', 401);

      const status = user.accountStatus || STATUSES.EMAIL_PENDING;
      if (isTerminalBlocked(status)) {
        throw new AppError(`Account is ${status.toLowerCase()}`, 403);
      }

      if (!allowedStatuses.includes(status)) {
        throw new AppError('Access denied for current account status', 403);
      }

      return next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = {
  requireEmailVerified,
  requireNotBanned,
  requireActiveAccount,
  statusGuard,
  STATUSES
};
