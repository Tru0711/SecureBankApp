import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useSelector } from 'react-redux';

import AuthLayout from '../components/layout/AuthLayout';
import UserLayout from '../components/layout/UserLayout';
import AdminLayout from '../components/layout/AdminLayout';

import ProtectedRoute from './ProtectedRoute';

// Auth pages
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import OtpVerificationPage from '../pages/auth/OtpVerificationPage';

// User pages
import DashboardPage from '../pages/dashboard/DashboardPage';
import WalletOverviewPage from '../pages/wallet/WalletOverviewPage';
import AddMoneyPage from '../pages/wallet/AddMoneyPage';
import SendMoneyPage from '../pages/wallet/SendMoneyPage';

import TransactionHistoryPage from '../pages/transactions/TransactionHistoryPage';
import TransactionDetailPage from '../pages/transactions/TransactionDetailPage';
import PersonalDetailsPage from '../pages/profile/PersonalDetailsPage';
import KycUploadPage from '../pages/profile/KycUploadPage';
import SecuritySettingsPage from '../pages/profile/SecuritySettingsPage';
import BeneficiariesPage from '../pages/profile/BeneficiariesPage';
import NomineesPage from '../pages/profile/NomineesPage';
import EmergencyContactsPage from '../pages/profile/EmergencyContactsPage';
import NotificationCenterPage from '../pages/notifications/NotificationCenterPage';
import MoneyRequestsPage from '../pages/requests/MoneyRequestsPage';
import UserSupportTicketsPage from '../pages/support/SupportTicketsPage';
import UserSecurityCenterPage from '../pages/security/SecurityCenterPage';
import LoginHistoryPage from '../pages/security/LoginHistoryPage';
import DeviceManagementPage from '../pages/security/DeviceManagementPage';
import ForgotPinPage from '../pages/security/ForgotPinPage';
import CompleteProfilePage from '../pages/onboarding/CompleteProfilePage';
import BankDetailsPage from '../pages/onboarding/BankDetailsPage';
import AwaitApprovalPage from '../pages/onboarding/AwaitApprovalPage';

// Admin pages
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import UserManagementPage from '../pages/admin/UserManagementPage';
import TransactionMonitoringPage from '../pages/admin/TransactionMonitoringPage';
import FraudAlertsPage from '../pages/admin/FraudAlertsPage';
import AdminUserDetailsPage from '../pages/admin/AdminUserDetailsPage';
import KycReviewCenterPage from '../pages/admin/KycReviewCenterPage';
import AdminLogsPage from '../pages/admin/AdminLogsPage';
import AdminSupportTicketsPage from '../pages/admin/SupportTicketsPage';
import SecurityCenterPage from '../pages/admin/SecurityCenterPage';

import { USER_ROLES } from '../utils/constants';

export default function AppRouter() {
  const { isAuthenticated, user } = useSelector((s) => s.auth);
  const authenticatedHome = user?.role === USER_ROLES.ADMIN ? '/admin' : '/dashboard';

  return (
    <Routes>
      {/* Auth */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin/login" element={<LoginPage adminMode />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/otp-verify" element={<OtpVerificationPage />} />
      </Route>

      {/* User */}
      <Route element={<ProtectedRoute role={USER_ROLES.USER} />}> 
        <Route element={<UserLayout />}>
          <Route path="/" element={<Navigate to={isAuthenticated ? authenticatedHome : '/login'} replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />

          <Route path="/onboarding/profile" element={<CompleteProfilePage />} />
          <Route path="/onboarding/bank" element={<BankDetailsPage />} />
          <Route path="/onboarding/kyc" element={<KycUploadPage />} />
          <Route path="/onboarding/await-approval" element={<AwaitApprovalPage />} />

          <Route path="/wallet" element={<WalletOverviewPage />} />
          <Route path="/wallet/add" element={<AddMoneyPage />} />
          <Route path="/wallet/send" element={<SendMoneyPage />} />


          <Route path="/transactions" element={<TransactionHistoryPage />} />
          <Route path="/transactions/:id" element={<TransactionDetailPage />} />

          <Route path="/beneficiaries" element={<BeneficiariesPage />} />
          <Route path="/money-requests" element={<MoneyRequestsPage />} />
          <Route path="/support-tickets" element={<UserSupportTicketsPage />} />
          <Route path="/security-center" element={<UserSecurityCenterPage />} />
          <Route path="/security-center/login-history" element={<LoginHistoryPage />} />
          <Route path="/security-center/devices" element={<DeviceManagementPage />} />

          <Route path="/notifications" element={<NotificationCenterPage />} />

          <Route path="/profile" element={<PersonalDetailsPage />} />
          <Route path="/profile/kyc" element={<KycUploadPage />} />
          <Route path="/profile/security" element={<SecuritySettingsPage />} />
          <Route path="/profile/security/forgot-pin" element={<ForgotPinPage />} />
          <Route path="/profile/nominees" element={<NomineesPage />} />
          <Route path="/profile/emergency-contacts" element={<EmergencyContactsPage />} />
        </Route>
      </Route>

      {/* Admin */}
      <Route element={<ProtectedRoute role={USER_ROLES.ADMIN} />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/users" element={<UserManagementPage />} />
          <Route path="/admin/users/:id" element={<AdminUserDetailsPage />} />
          <Route path="/admin/kyc" element={<KycReviewCenterPage />} />
          <Route path="/admin/activity-logs" element={<AdminLogsPage type="activity" />} />
          <Route path="/admin/audit-logs" element={<AdminLogsPage type="audit" />} />
          <Route path="/admin/tickets" element={<AdminSupportTicketsPage />} />
          <Route path="/admin/security" element={<SecurityCenterPage />} />
          <Route path="/admin/transactions" element={<TransactionMonitoringPage />} />
          <Route path="/admin/fraud" element={<FraudAlertsPage />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to={isAuthenticated ? authenticatedHome : '/login'} replace />} />
    </Routes>
  );
}

