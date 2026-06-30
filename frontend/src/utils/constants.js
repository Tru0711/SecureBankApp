export const TRANSACTION_TYPES = {
  DEPOSIT: 'DEPOSIT',
  WITHDRAWAL: 'WITHDRAWAL',
  TRANSFER: 'TRANSFER',
  CREDIT: 'CREDIT',
  DEBIT: 'DEBIT',
};

export const TRANSACTION_STATUS = {
  PENDING: 'PENDING',
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED',
};

export const KYC_STATUS = {
  PENDING: 'PENDING',
  VERIFIED: 'VERIFIED',
  REJECTED: 'REJECTED',
};

export const ACCOUNT_STATUS = {
  ACTIVE: 'ACTIVE',
  SUSPENDED: 'SUSPENDED',
  BLOCKED: 'BLOCKED',
};

export const USER_ROLES = {
  USER: 'USER',
  ADMIN: 'ADMIN',
};

export const STATUS_COLORS = {
  SUCCESS: 'success',
  FAILED: 'danger',
  PENDING: 'warning',
  CANCELLED: 'secondary',
  VERIFIED: 'success',
  REJECTED: 'danger',
  ACTIVE: 'success',
  SUSPENDED: 'warning',
  BLOCKED: 'danger',
  CLOSED: 'secondary',
  HIGH: 'danger',
  URGENT: 'danger',
  MEDIUM: 'warning',
  LOW: 'info',
};

export const TRANSACTION_ICONS = {
  DEPOSIT: 'bi-arrow-down-circle',
  WITHDRAWAL: 'bi-arrow-up-circle',
  TRANSFER: 'bi-arrow-left-right',
  CREDIT: 'bi-plus-circle',
  DEBIT: 'bi-dash-circle',
};

export const CURRENCY_SYMBOL = '₹';

export const SIDEBAR_LINKS = {
  user: [
    { label: 'Dashboard', path: '/dashboard', icon: 'bi-grid-1x2' },
    { label: 'Add Money', path: '/wallet/add', icon: 'bi-plus-circle' },
    { label: 'Send Money', path: '/wallet/send', icon: 'bi-send' },
    { label: 'Transactions', path: '/transactions', icon: 'bi-arrow-left-right' },

    { label: 'Money Requests', path: '/money-requests', icon: 'bi-cash-coin' },
    { label: 'Profile', path: '/profile', icon: 'bi-person' },
    { label: 'KYC Status', path: '/profile/kyc', icon: 'bi-file-earmark-check' },
    { label: 'Security Settings', path: '/profile/security', icon: 'bi-shield-check' },
    { label: 'Support Tickets', path: '/support-tickets', icon: 'bi-life-preserver' },
  ],
  admin: [
    { label: 'Dashboard', path: '/admin', icon: 'bi-speedometer2' },
    { label: 'Users', path: '/admin/users', icon: 'bi-people', group: 'Users' },
    { label: 'KYC Review', path: '/admin/kyc', icon: 'bi-file-earmark-check', group: 'KYC Review' },
    { label: 'Transactions', path: '/admin/transactions', icon: 'bi-arrow-left-right', group: 'Transactions' },
    { label: 'Fraud Center', path: '/admin/fraud', icon: 'bi-exclamation-triangle', group: 'Fraud Center' },
    { label: 'Support Tickets', path: '/admin/tickets', icon: 'bi-life-preserver', group: 'Users' },
    { label: 'Security Events', path: '/admin/security', icon: 'bi-shield-lock', group: 'Security' },
    { label: 'Audit Logs', path: '/admin/audit-logs', icon: 'bi-journal-text', group: 'Security' },
  ],
};
