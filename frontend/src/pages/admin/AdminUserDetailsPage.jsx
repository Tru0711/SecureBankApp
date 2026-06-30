import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import GlassCard from '../../components/common/GlassCard';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import AmountDisplay from '../../components/common/AmountDisplay';
import { adminApi } from '../../services/adminApi';
import { formatDateTime, getRiskClass, getRiskLevel, getUserName } from '../../utils/adminFormat';

function Section({ title, children }) {
  return (
    <GlassCard className="p-4 mb-4">
      <h6 className="fw-bold mb-3">{title}</h6>
      {children}
    </GlassCard>
  );
}

function Detail({ label, value }) {
  return (
    <div>
      <div className="text-muted-sp small">{label}</div>
      <div className="fw-semibold">{value || '-'}</div>
    </div>
  );
}

export default function AdminUserDetailsPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadUser = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getUserDetails(id);
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load user details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, [id]);

  const runAction = async (label, fn) => {
    setMessage('');
    setError('');
    try {
      const res = await fn();
      setMessage(res.data?.temporaryPassword ? `${label}: ${res.data.temporaryPassword}` : `${label} completed`);
      await loadUser();
    } catch (err) {
      setError(err.response?.data?.message || `${label} failed`);
    }
  };

  const timeline = useMemo(() => {
    const activity = data?.activityLogs || [];
    const sessions = data?.loginHistory || [];
    const transactions = data?.transactions || [];
    const bankAccounts = data?.bankAccounts || [];

    return [
      ...(data?.user ? [{ id: `${data.user._id}-registered`, at: data.user.createdAt, title: 'Registered', meta: data.user.email }] : []),
      ...activity.map((log) => ({ id: log._id, at: log.createdAt, title: log.action, meta: log.statusMessage || log.resource || 'Audit log' })),
      ...sessions.map((session) => ({ id: session._id, at: session.createdAt, title: session.isActive ? 'Login session active' : 'Login session ended', meta: session.ipAddress || 'Session' })),
      ...transactions.map((txn) => ({ id: txn._id, at: txn.createdAt, title: 'Transaction created', meta: `${txn.type} - ${txn.status}` })),
      ...bankAccounts.map((account) => ({ id: account._id, at: account.createdAt, title: 'Bank added', meta: account.bankName || account.maskedAccountNumber }))
    ]
      .filter((item) => item.at)
      .sort((a, b) => new Date(b.at) - new Date(a.at))
      .slice(0, 30);
  }, [data]);

  if (loading) return <LoadingSpinner text="Loading user details..." />;
  if (!data?.user) return <GlassCard className="p-4">User not found</GlassCard>;

  const { user, bankAccounts = [], kyc, transactions = [] } = data;
  const actionButtons = [];

  if (['ADMIN_REVIEW_PENDING', 'KYC_PENDING', 'PROFILE_INCOMPLETE', 'BANK_DETAILS_PENDING'].includes(user.accountStatus)) {
    actionButtons.push(
      <button key="approve" className="btn btn-sm btn-success" onClick={() => runAction('Approve user', () => adminApi.approveUser(user._id))}>Approve</button>,
      <button key="reject" className="btn btn-sm btn-danger" onClick={() => runAction('Reject user', () => adminApi.rejectUser(user._id, window.prompt('Reject reason') || 'Rejected by admin'))}>Reject</button>
    );
  }

  if (user.accountStatus === 'ACTIVE') {
    actionButtons.push(
      <button key="freeze" className="btn btn-sm btn-warning" onClick={() => runAction('Freeze user', () => adminApi.freezeUser(user._id))}>Freeze</button>,
      <button key="ban" className="btn btn-sm btn-danger" onClick={() => runAction('Ban user', () => adminApi.banUser(user._id, window.prompt('Ban reason') || 'Banned by admin'))}>Ban</button>,
      <button key="logout" className="btn btn-sm btn-sp-outline" onClick={() => runAction('Force logout', () => adminApi.forceLogoutUser(user._id))}>Force Logout</button>,
      <button key="reset" className="btn btn-sm btn-sp-outline" onClick={() => runAction('Reset password', () => adminApi.resetUserPassword(user._id))}>Reset Password</button>
    );
  }

  if (user.accountStatus === 'FROZEN') {
    actionButtons.push(
      <button key="unfreeze" className="btn btn-sm btn-success" onClick={() => runAction('Unfreeze user', () => adminApi.unfreezeUser(user._id))}>Unfreeze</button>
    );
  }

  return (
    <div>
      <PageHeader title={getUserName(user)} subtitle={user.email}>
        {actionButtons}
      </PageHeader>

      {message && <div className="alert alert-success py-2 small">{message}</div>}
      {error && <div className="alert alert-danger py-2 small">{error}</div>}

      <div className="row g-4">
        <div className="col-xl-4">
          <Section title="Profile">
            <div className="row g-3">
              <div className="col-12"><Detail label="Full Name" value={getUserName(user)} /></div>
              <div className="col-12"><Detail label="Email" value={user.email} /></div>
              <div className="col-12"><Detail label="Phone" value={user.phone} /></div>
              <div className="col-6"><div className="text-muted-sp small mb-1">Status</div><StatusBadge status={user.accountStatus} /></div>
              <div className="col-6"><div className="text-muted-sp small mb-1">KYC Level</div><StatusBadge status={user.kycStatus} /></div>
              <div className="col-12"><Detail label="Registration Date" value={formatDateTime(user.createdAt)} /></div>
              <div className="col-12"><Detail label="Last Login" value={formatDateTime(user.lastLogin)} /></div>
            </div>
          </Section>

          <Section title="KYC Details">
            {kyc ? (
              <div className="d-flex flex-column gap-2">
                <div>Status: <StatusBadge status={kyc.status} /></div>
                <div className="text-muted-sp small">PAN: {kyc.documents?.panCard ? 'Submitted' : 'Not submitted'}</div>
                <div className="text-muted-sp small">Aadhaar: {kyc.documents?.aadhaarCard ? 'Submitted' : 'Not submitted'}</div>
                <div className="text-muted-sp small">Face Verification: {kyc.documents?.selfie ? 'Submitted' : 'Not submitted'}</div>
                <div className="text-muted-sp small">Submitted: {formatDateTime(kyc.createdAt)}</div>
                {kyc.rejectionReason && <div className="text-danger small">{kyc.rejectionReason}</div>}
              </div>
            ) : (
              <EmptyState icon="bi-file-earmark-check" title="No KYC submission" message="This user has not submitted KYC documents." />
            )}
          </Section>
        </div>

        <div className="col-xl-8">
          <Section title="Bank Accounts">
            {bankAccounts.length === 0 ? (
              <EmptyState icon="bi-bank" title="No bank accounts" message="No linked bank account records are available for this user." />
            ) : (
              <div className="table-responsive">
                <table className="table table-dark-sp mb-0 align-middle">
                  <thead>
                    <tr>
                      <th>Bank Name</th>
                      <th>Account Number</th>
                      <th>IFSC</th>
                      <th>Verification Status</th>
                      <th>Primary</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bankAccounts.map((account) => (
                      <tr key={account._id}>
                        <td>{account.bankName || '-'}</td>
                        <td className="text-muted-sp small">{account.maskedAccountNumber || '-'}</td>
                        <td className="text-muted-sp small">{account.ifscCode || account.ifsc || '-'}</td>
                        <td><StatusBadge status={account.isVerified ? 'VERIFIED' : 'PENDING'} /></td>
                        <td>{account.isPrimary ? 'Yes' : 'No'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Section>

          <Section title="Transactions">
            {transactions.length === 0 ? (
              <EmptyState icon="bi-arrow-left-right" title="No transactions" message="No transaction history is available for this user." />
            ) : (
              <div className="table-responsive">
                <table className="table table-dark-sp mb-0 align-middle">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Type</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Risk Flag</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((txn) => {
                      const risk = getRiskLevel(txn.fraudScore, txn.isFlagged);
                      return (
                        <tr key={txn._id}>
                          <td className="text-muted-sp small">{formatDateTime(txn.createdAt)}</td>
                          <td>{txn.type}</td>
                          <td><AmountDisplay amount={txn.amount} /></td>
                          <td><StatusBadge status={txn.status} /></td>
                          <td className={`fw-bold ${getRiskClass(risk)}`}>{risk}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Section>

          <Section title="Activity Timeline">
            {timeline.length === 0 ? (
              <EmptyState icon="bi-clock-history" title="No activity" message="No chronological activity is available for this user." />
            ) : (
              <div className="d-flex flex-column gap-3">
                {timeline.map((item) => (
                  <div key={item.id} className="d-flex justify-content-between gap-3 border-bottom pb-3" style={{ borderColor: 'var(--sp-border)' }}>
                    <div>
                      <div className="fw-bold">{item.title}</div>
                      <div className="text-muted-sp small">{item.meta}</div>
                    </div>
                    <div className="text-muted-sp small text-end">{formatDateTime(item.at)}</div>
                  </div>
                ))}
              </div>
            )}
          </Section>
        </div>
      </div>
    </div>
  );
}
