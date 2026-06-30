import React from 'react';
import PageHeader from '../../components/common/PageHeader';
import GlassCard from '../../components/common/GlassCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import { securityApi } from '../../services/securityApi';
import useAsyncItems from '../../hooks/useAsyncItems';

export default function DeviceManagementPage() {
  const { items, loading, error, load } = useAsyncItems(securityApi.getDevices, 'Unable to load devices');

  const logoutDevice = async (sessionId) => {
    await securityApi.logoutDevice(sessionId);
    await load();
  };

  return (
    <div>
      <PageHeader title="Device Management" subtitle="Review devices and revoke active sessions." />
      {error && <div className="alert alert-danger py-2 small">{error}</div>}
      {loading ? <LoadingSpinner text="Loading devices..." /> : (
        <div className="d-flex flex-column gap-3">
          {items.map((item) => (
            <GlassCard key={item._id}>
              <div className="d-flex flex-wrap justify-content-between gap-3">
                <div>
                  <h5 className="fw-bold mb-1">{item.device?.deviceName || item.device?.deviceType || item.deviceFingerprint || 'Unknown Device'}</h5>
                  <div className="text-muted-sp small">Browser: {item.browser}</div>
                  <div className="text-muted-sp small">IP: {item.ipAddress || '-'}</div>
                  <div className="text-muted-sp small">Login Time: {new Date(item.loginTime).toLocaleString()}</div>
                </div>
                <div className="text-end">
                  <StatusBadge status={item.isActive ? 'ACTIVE' : 'CLOSED'} />
                  {item.isActive && (
                    <div className="mt-3">
                      <button className="btn btn-sm btn-outline-danger" onClick={() => logoutDevice(item._id)}>
                        Logout Device
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
