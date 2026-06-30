const STATUSES = {
  EMAIL_PENDING: 'EMAIL_PENDING',
  PROFILE_INCOMPLETE: 'PROFILE_INCOMPLETE',
  BANK_DETAILS_PENDING: 'BANK_DETAILS_PENDING',
  KYC_PENDING: 'KYC_PENDING',
  ADMIN_REVIEW_PENDING: 'ADMIN_REVIEW_PENDING',
  ACTIVE: 'ACTIVE',
  REJECTED: 'REJECTED',
  FROZEN: 'FROZEN',
  BANNED: 'BANNED'
};

const isTerminalBlocked = (status) => {
  return status === STATUSES.REJECTED || status === STATUSES.FROZEN || status === STATUSES.BANNED;
};

// Centralized (lightweight) transition rules for Phase 1 foundation.
// Phase 2 will enforce full onboarding routing.
const canTransition = (from, to) => {
  if (!from) return true;
  if (from === to) return true;

  // Allow admin overrides
  if ([STATUSES.FROZEN, STATUSES.BANNED, STATUSES.REJECTED].includes(to)) return true;

  // Allow progressing forward to ACTIVE only
  const progression = [
    STATUSES.EMAIL_PENDING,
    STATUSES.PROFILE_INCOMPLETE,
    STATUSES.BANK_DETAILS_PENDING,
    STATUSES.KYC_PENDING,
    STATUSES.ADMIN_REVIEW_PENDING,
    STATUSES.ACTIVE
  ];

  const fromIdx = progression.indexOf(from);
  const toIdx = progression.indexOf(to);

  // If either is unknown, allow (Phase 2 will tighten)
  if (fromIdx === -1 || toIdx === -1) return true;

  // Only allow forward progression
  return toIdx > fromIdx;
};

module.exports = {
  STATUSES,
  isTerminalBlocked,
  canTransition
};
