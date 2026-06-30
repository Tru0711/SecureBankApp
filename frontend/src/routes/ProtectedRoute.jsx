import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { USER_ROLES } from '../utils/constants';

export default function ProtectedRoute({ role = USER_ROLES.USER }) {
  const location = useLocation();
  const { isAuthenticated, user } = useSelector((s) => s.auth);


  if (!isAuthenticated) {
    const loginPath = role === USER_ROLES.ADMIN ? '/admin/login' : '/login';
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  if (role) {
    const allowed = user?.role === role;
    if (!allowed) {
      const fallbackPath = user?.role === USER_ROLES.ADMIN ? '/admin' : '/dashboard';
      return <Navigate to={fallbackPath} replace />;
    }
  }

  if (role === USER_ROLES.USER) {
    const statusTargets = {
      EMAIL_PENDING: `/otp-verify?email=${encodeURIComponent(user?.email || '')}`,
      PROFILE_INCOMPLETE: '/onboarding/profile',
      BANK_DETAILS_PENDING: '/onboarding/bank',
      KYC_PENDING: '/onboarding/kyc',
      ADMIN_REVIEW_PENDING: '/onboarding/await-approval',
      ACTIVE: '/dashboard'
    };

    const target = statusTargets[user?.accountStatus];
    const onboardingPaths = ['/onboarding/profile', '/onboarding/bank', '/onboarding/kyc', '/onboarding/await-approval'];
    const securityPaths = ['/security-center', '/profile/security', '/profile/security/forgot-pin'];
    const canManageSecurityDuringOnboarding = user?.accountStatus !== 'EMAIL_PENDING' && securityPaths.includes(location.pathname);

    if (target && user?.accountStatus !== 'ACTIVE' && location.pathname !== target.split('?')[0] && !canManageSecurityDuringOnboarding) {
      return <Navigate to={target} replace />;
    }

    if (user?.accountStatus === 'ACTIVE' && onboardingPaths.includes(location.pathname)) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <Outlet />;
}



