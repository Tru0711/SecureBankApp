import React, { useEffect, useMemo, useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import GlassCard from '../../components/common/GlassCard';
import MetricCard from '../../components/common/MetricCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import AmountDisplay from '../../components/common/AmountDisplay';
import StatusBadge from '../../components/common/StatusBadge';
import { adminApi } from '../../services/adminApi';
import { formatDateTime, getRiskClass, getRiskLevel, getUserName } from '../../utils/adminFormat';

export default function FraudAlertsPage() {
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await adminApi.getFraudAlerts({ limit: 100 });
        const alerts = res.data.items || [];
        setItems(alerts);
        setSelected(alerts[0] || null);
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load fraud alerts');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const overview = useMemo(() => ({
    open: items.filter((txn) => txn.status !== 'CANCELLED').length,
    critical: items.filter((txn) => Number(txn.fraudScore || 0) >= 80).length,
    resolved: items.filter((txn) => txn.status === 'CANCELLED').length
  }), [items]);

  const freezeSelectedUser = async () => {
    if (!selected?.userId?._id) return;
    setMessage('');
    setError('');
    try {
      await adminApi.freezeUser(selected.userId._id);
      setMessage('Related user account frozen');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to freeze related account');
    }
  };

  return (
    <div>
      <PageHeader title="Fraud Center" subtitle="Fraud operations for flagged transactions, alert triage, and account intervention." />
      {message && <div className="alert alert-success py-2 small">{message}</div>}
      {error && <div className="alert alert-danger py-2 small">{error}</div>}
      {loading ? <LoadingSpinner text="Loading fraud center..." /> : (
        <>
          <div className="row g-3 mb-4">
            <div className="col-md-4">
              <MetricCard label="Open Alerts" value={overview.open} icon="bi-exclamation-triangle" color="var(--sp-warning)" />
            </div>
            <div className="col-md-4">
              <MetricCard label="Critical Alerts" value={overview.critical} icon="bi-radioactive" color="var(--sp-danger)" />
            </div>
            <div className="col-md-4">
              <MetricCard label="Resolved Alerts" value={overview.resolved} icon="bi-check2-circle" color="var(--sp-success)" />
            </div>
          </div>

          {items.length === 0 ? (
            <GlassCard className="p-4">
              <EmptyState icon="bi-shield-check" title="No fraud alerts" message="No flagged transactions are currently awaiting investigation." />
            </GlassCard>
          ) : (
            <div className="row g-4">
              <div className="col-xl-7">
                <GlassCard className="p-4">
                  <h6 className="fw-bold mb-3">Fraud Alerts</h6>
                  <div className="table-responsive">
                    <table className="table table-dark-sp mb-0 align-middle">
                      <thead>
                        <tr>
                          <th>Alert Type</th>
                          <th>User</th>
                          <th>Severity</th>
                          <th>Created Time</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((txn) => {
                          const risk = getRiskLevel(txn.fraudScore, txn.isFlagged);
                          return (
                            <tr key={txn._id} onClick={() => setSelected(txn)} style={{ cursor: 'pointer' }}>
                              <td>
                                {txn.fraudReason || 'Suspicious Transfer'}
                                <div className="text-muted-sp small">{txn.transactionId}</div>
                              </td>
                              <td>{getUserName(txn.userId)}</td>
                              <td className={`fw-bold ${getRiskClass(risk)}`}>{risk}</td>
                              <td className="text-muted-sp small">{formatDateTime(txn.createdAt)}</td>
                              <td><StatusBadge status={txn.status} /></td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </GlassCard>
              </div>

              <div className="col-xl-5">
                <GlassCard className="p-4">
                  <h6 className="fw-bold mb-3">Investigation Panel</h6>
                  {selected ? (
                    <div className="d-flex flex-column gap-3">
                      <div className="soft-card p-3">
                        <div className="text-muted-sp small">Linked Transaction</div>
                        <div className="fw-bold">{selected.transactionId || selected._id}</div>
                        <div className="d-flex justify-content-between mt-2">
                          <AmountDisplay amount={selected.amount} />
                          <StatusBadge status={selected.status} />
                        </div>
                      </div>
                      <div className="soft-card p-3">
                        <div className="text-muted-sp small">Related User</div>
                        <div className="fw-bold">{getUserName(selected.userId)}</div>
                        <div className="text-muted-sp small">{selected.userId?.email || '-'}</div>
                      </div>
                      <div className="soft-card p-3">
                        <div className="text-muted-sp small">Related Device</div>
                        <div className="fw-bold">{selected.deviceFingerprint || 'No device fingerprint'}</div>
                        <div className="text-muted-sp small">{selected.ipAddress || 'No IP address'}</div>
                      </div>
                      <div className="soft-card p-3">
                        <div className="text-muted-sp small">Alert Timeline</div>
                        <div className="fw-bold">Flagged at {formatDateTime(selected.createdAt)}</div>
                        <div className="text-muted-sp small">{selected.fraudReason || 'Transaction flagged by monitoring rules.'}</div>
                      </div>
                      {selected.userId?._id && selected.userId?.accountStatus !== 'FROZEN' && (
                        <button className="btn btn-sm btn-danger align-self-start" onClick={freezeSelectedUser}>
                          Freeze Account
                        </button>
                      )}
                    </div>
                  ) : (
                    <EmptyState icon="bi-search" title="No alert selected" message="Select an alert to inspect linked records." />
                  )}
                </GlassCard>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
