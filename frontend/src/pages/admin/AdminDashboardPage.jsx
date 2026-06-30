import React, { useEffect, useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import GlassCard from '../../components/common/GlassCard';
import MetricCard from '../../components/common/MetricCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import StatusBadge from '../../components/common/StatusBadge';
import AmountDisplay from '../../components/common/AmountDisplay';
import { adminApi } from '../../services/adminApi';
import { formatDateTime, getRiskClass, getRiskLevel, getUserName } from '../../utils/adminFormat';

function ActivityPanel({ title, icon, items, children, emptyMessage }) {
  return (
    <GlassCard className="p-4 h-100">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h6 className="fw-bold mb-0">{title}</h6>
        <i className={`bi ${icon} text-muted-sp`} />
      </div>
      {items.length === 0 ? (
        <EmptyState icon={icon} title="No records" message={emptyMessage} />
      ) : (
        <div className="d-flex flex-column gap-3">{children}</div>
      )}
    </GlassCard>
  );
}

export default function AdminDashboardPage() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await adminApi.getDashboard();
        setDashboard(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load admin dashboard');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <LoadingSpinner text="Loading operations dashboard..." />;

  const fraudAlerts = dashboard?.recentFraudAlerts || [];
  const securityEvents = dashboard?.recentSecurityEvents || [];
  const highRiskTransactions = dashboard?.recentHighRiskTransactions || [];

  return (
    <div>
      <PageHeader
        title="Operations Dashboard"
        subtitle="Platform-wide view of users, compliance queues, financial activity, fraud signals, and security events."
      />

      {error && <div className="alert alert-danger py-2 small">{error}</div>}

      <div className="row g-3 mb-4">
        <div className="col-xl-2 col-md-4 col-6">
          <MetricCard label="Total Users" value={dashboard?.userCount || 0} icon="bi-people" color="var(--sp-primary)" />
        </div>
        <div className="col-xl-2 col-md-4 col-6">
          <MetricCard label="Active Users" value={dashboard?.activeUserCount || 0} icon="bi-person-check" color="var(--sp-success)" />
        </div>
        <div className="col-xl-2 col-md-4 col-6">
          <MetricCard label="Pending KYC" value={dashboard?.pendingKycCount || 0} icon="bi-file-earmark-check" color="var(--sp-warning)" />
        </div>
        <div className="col-xl-2 col-md-4 col-6">
          <MetricCard label="Today's Transactions" value={dashboard?.todaysTransactionCount || 0} icon="bi-arrow-left-right" color="var(--sp-primary-2)" />
        </div>
        <div className="col-xl-2 col-md-4 col-6">
          <MetricCard label="Fraud Alerts" value={dashboard?.flaggedTxnCount || 0} icon="bi-exclamation-triangle" color="var(--sp-danger)" />
        </div>
        <div className="col-xl-2 col-md-4 col-6">
          <MetricCard label="Security Events" value={dashboard?.securityEventCount || 0} icon="bi-shield-lock" color="var(--sp-warning)" />
        </div>
      </div>

      <div className="row g-4">
        <div className="col-xl-4">
          <ActivityPanel
            title="Latest Fraud Alerts"
            icon="bi-exclamation-triangle"
            items={fraudAlerts}
            emptyMessage="No flagged transactions are currently available."
          >
            {fraudAlerts.map((txn) => (
              <div key={txn._id} className="soft-card p-3">
                <div className="d-flex justify-content-between gap-3">
                  <div>
                    <div className="fw-bold">{txn.transactionId || txn._id}</div>
                    <div className="text-muted-sp small">{getUserName(txn.userId)}</div>
                  </div>
                  <span className={`fw-bold ${getRiskClass(getRiskLevel(txn.fraudScore, txn.isFlagged))}`}>
                    {txn.fraudScore || 0}/100
                  </span>
                </div>
                <div className="d-flex justify-content-between align-items-center mt-2">
                  <span className="text-muted-sp small">{txn.fraudReason || txn.type}</span>
                  <StatusBadge status={txn.status} />
                </div>
              </div>
            ))}
          </ActivityPanel>
        </div>

        <div className="col-xl-4">
          <ActivityPanel
            title="Latest Security Events"
            icon="bi-shield-lock"
            items={securityEvents}
            emptyMessage="No security events have been recorded yet."
          >
            {securityEvents.map((log) => (
              <div key={log._id} className="soft-card p-3">
                <div className="d-flex justify-content-between gap-3">
                  <div>
                    <div className="fw-bold">{log.action}</div>
                    <div className="text-muted-sp small">{getUserName(log.userId)}</div>
                  </div>
                  <StatusBadge status={log.severity} />
                </div>
                <div className="text-muted-sp small mt-2">{formatDateTime(log.createdAt)}</div>
              </div>
            ))}
          </ActivityPanel>
        </div>

        <div className="col-xl-4">
          <ActivityPanel
            title="Latest High-Risk Transactions"
            icon="bi-cash-stack"
            items={highRiskTransactions}
            emptyMessage="No high-risk transactions are currently available."
          >
            {highRiskTransactions.map((txn) => {
              const risk = getRiskLevel(txn.fraudScore, txn.isFlagged);
              return (
                <div key={txn._id} className="soft-card p-3">
                  <div className="d-flex justify-content-between gap-3">
                    <div>
                      <div className="fw-bold">{getUserName(txn.userId)}</div>
                      <div className="text-muted-sp small">{txn.type} · {formatDateTime(txn.createdAt)}</div>
                    </div>
                    <AmountDisplay amount={txn.amount} />
                  </div>
                  <div className="d-flex justify-content-between align-items-center mt-2">
                    <span className={getRiskClass(risk)}>{risk} RISK</span>
                    <StatusBadge status={txn.status} />
                  </div>
                </div>
              );
            })}
          </ActivityPanel>
        </div>
      </div>
    </div>
  );
}
