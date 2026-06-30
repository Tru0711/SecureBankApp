import React, { useEffect, useMemo, useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import GlassCard from '../../components/common/GlassCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import StatusBadge from '../../components/common/StatusBadge';
import { adminApi } from '../../services/adminApi';
import { formatDateTime, getUserName } from '../../utils/adminFormat';

const securityActions = new Set([
  'LOGIN',
  'LOGOUT',
  'PASSWORD_RESET',
  'PASSWORD_CHANGE',
  'DEVICE_ADDED',
  'DEVICE_REMOVED',
  '2FA_ENABLED',
  '2FA_DISABLED',
  'ADMIN_ACTION',
  'ACCOUNT_FROZEN',
  'ACCOUNT_UNFROZEN',
  'ACCOUNT_BANNED'
]);

export default function SecurityCenterPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const audit = await adminApi.getAuditLogs();
        setLogs(audit.data.items || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load security center');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const securityLogs = useMemo(() => logs.filter((log) => securityActions.has(log.action)), [logs]);

  return (
    <div>
      <PageHeader title="Security" subtitle="Security monitoring for authentication, account control, device, and administrative activity." />
      {error && <div className="alert alert-danger py-2 small">{error}</div>}
      {loading ? <LoadingSpinner text="Loading security events..." /> : (
        <GlassCard className="p-4">
          <h6 className="fw-bold mb-3">Security Events</h6>
          {securityLogs.length === 0 ? (
            <EmptyState icon="bi-shield-lock" title="No security events" message="No security events are currently available in the audit log." />
          ) : (
            <div className="table-responsive">
              <table className="table table-dark-sp mb-0 align-middle">
                <thead>
                  <tr>
                    <th>Event</th>
                    <th>User</th>
                    <th>Status</th>
                    <th>Severity</th>
                    <th>Timestamp</th>
                    <th>IP Address</th>
                  </tr>
                </thead>
                <tbody>
                  {securityLogs.map((log) => (
                    <tr key={log._id}>
                      <td>{log.action}</td>
                      <td>{getUserName(log.userId)}</td>
                      <td><StatusBadge status={log.status} /></td>
                      <td><StatusBadge status={log.severity} /></td>
                      <td className="text-muted-sp small">{formatDateTime(log.createdAt)}</td>
                      <td className="text-muted-sp small">{log.ipAddress || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </GlassCard>
      )}
    </div>
  );
}
