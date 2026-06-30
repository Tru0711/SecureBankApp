import React, { useEffect, useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import GlassCard from '../../components/common/GlassCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import { securityApi } from '../../services/securityApi';

export default function LoginHistoryPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await securityApi.getLoginHistory();
        setItems(res.data.items || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load login history');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div>
      <PageHeader title="Login History" subtitle="Review recent account sessions." />
      {error && <div className="alert alert-danger py-2 small">{error}</div>}
      {loading ? <LoadingSpinner text="Loading login history..." /> : (
        <GlassCard>
          <div className="table-responsive">
            <table className="table table-dark-sp mb-0">
              <thead>
                <tr>
                  <th>Device</th>
                  <th>Browser</th>
                  <th>IP</th>
                  <th>Login Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item._id}>
                    <td>{item.deviceFingerprint || 'Unknown'}</td>
                    <td>{item.browser}</td>
                    <td className="text-muted-sp small">{item.ipAddress || '-'}</td>
                    <td className="text-muted-sp small">{new Date(item.loginTime).toLocaleString()}</td>
                    <td><StatusBadge status={item.isActive ? 'ACTIVE' : 'CLOSED'} /></td>
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
