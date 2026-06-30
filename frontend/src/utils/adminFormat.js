export const formatDateTime = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '-' : date.toLocaleString();
};

export const formatDate = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '-' : date.toLocaleDateString();
};

export const getUserName = (user) => {
  if (!user) return '-';
  const name = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
  return name || user.email || user._id || '-';
};

export const getRiskLevel = (score = 0, flagged = false) => {
  if (flagged || score >= 70) return 'HIGH';
  if (score >= 35) return 'MEDIUM';
  return 'LOW';
};

export const getRiskClass = (riskLevel) => {
  if (riskLevel === 'HIGH' || riskLevel === 'CRITICAL') return 'text-danger';
  if (riskLevel === 'MEDIUM') return 'text-warning';
  return 'text-success';
};

export const userMatchesSearch = (user, search) => {
  const needle = search.trim().toLowerCase();
  if (!needle) return true;

  return [
    getUserName(user),
    user.email,
    user.phone,
    user._id
  ]
    .filter(Boolean)
    .some((value) => String(value).toLowerCase().includes(needle));
};

export const filterUsersByStatus = (users, filter) => {
  if (filter === 'ALL') return users;
  if (filter === 'PENDING_KYC') {
    return users.filter((user) => ['PENDING', 'KYC_PENDING', 'UNDER_REVIEW'].includes(user.kycStatus) || user.accountStatus === 'KYC_PENDING');
  }
  if (filter === 'VERIFIED') {
    return users.filter((user) => ['LEVEL_1_VERIFIED', 'LEVEL_2_VERIFIED', 'VERIFIED'].includes(user.kycStatus));
  }
  return users.filter((user) => user.accountStatus === filter);
};
