import React, { useEffect, useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import GlassCard from '../../components/common/GlassCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import { adminApi } from '../../services/adminApi';

export default function AdminLogsPage({ type = 'audit' }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const isActivity = type === 'activity';

  useEffect(() => {
    (async () => {
      try {
        const res = isActivity ? await adminApi.getActivityLogs() : await adminApi.getAuditLogs();
        setItems(res.data.items || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load logs');
      } finally {
        setLoading(false);
      }
    })();
  }, [isActivity]);

  return (
    <div>
      <PageHeader title={isActivity ? 'Activity Logs' : 'Audit Logs'} subtitle="Review recorded platform activity." />
      {error && <div className="alert alert-danger py-2 small">{error}</div>}
      {loading ? <LoadingSpinner text="Loading logs..." /> : (
        <GlassCard>
          <div className="table-responsive">
            <table className="table table-dark-sp mb-0">
              <thead>
                <tr>
                  <th>Action</th>
                  <th>User</th>
                  <th>Status</th>
                  <th>Severity</th>
                  <th>IP</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {items.map((log) => (
                  <tr key={log._id}>
                    <td>{log.action}</td>
                    <td>{log.userId?.email || log.userId?._id || '-'}</td>
                    <td><StatusBadge status={log.status} /></td>
                    <td>{log.severity}</td>
                    <td className="text-muted-sp small">{log.ipAddress || '-'}</td>
                    <td className="text-muted-sp small">{new Date(log.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}
    </div>
  );
}
