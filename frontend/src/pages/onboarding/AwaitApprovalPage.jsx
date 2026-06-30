import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GlassCard from '../../components/common/GlassCard';
import PageHeader from '../../components/common/PageHeader';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { userApi } from '../../services/userApi';

function StatusRow({ label, value }) {
  const tone = ['COMPLETED', 'APPROVED', 'ACTIVE'].includes(value) ? 'success' : value === 'REJECTED' ? 'danger' : 'warning';
  return (
    <div className="d-flex align-items-center justify-content-between py-3 border-bottom" style={{ borderColor: 'var(--sp-border)' }}>
      <span className="text-muted-sp">{label}</span>
      <span className={`status-pill badge-soft-${tone}`}>{value || 'PENDING'}</span>
    </div>
  );
}

export default function AwaitApprovalPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadStatus = async () => {
    setLoading(true);
    try {
      const res = await userApi.getOnboardingStatus();
      setStatus(res.data);
      if (res.data.accountStatus === 'ACTIVE') {
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load approval status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  return (
    <div>
      <PageHeader title="Awaiting Approval" subtitle="Your onboarding submission is being reviewed.">
        <button className="btn btn-sp-outline" onClick={loadStatus}>Refresh</button>
      </PageHeader>

      {error && <div className="alert alert-danger py-2 small">{error}</div>}
      {loading ? (
        <LoadingSpinner text="Loading approval status..." />
      ) : (
        <div className="row g-4">
          <div className="col-lg-7">
            <GlassCard>
              <StatusRow label="Profile Status" value={status?.profile?.status} />
              <StatusRow label="Bank Status" value={status?.bank?.status} />
              <StatusRow label="KYC Status" value={status?.kyc?.status} />
              <StatusRow label="Approval Status" value={status?.approval?.status} />
              {status?.kyc?.rejectionReason && (
                <div className="alert alert-danger mt-4 mb-0">
                  {status.kyc.rejectionReason}
                </div>
              )}
            </GlassCard>
          </div>
          <div className="col-lg-5">
            <GlassCard>
              <h5 className="fw-bold mb-3">Review Summary</h5>
              <p className="text-muted-sp small mb-3">Current account status</p>
              <h3 className="fw-bold mb-4">{status?.accountStatus}</h3>
              {status?.bank?.primary && (
                <div className="soft-card p-3">
                  <small className="text-muted-sp d-block mb-1">Primary Bank</small>
                  <div className="fw-bold">{status.bank.primary.bankName}</div>
                  <div className="text-muted-sp small">{status.bank.primary.maskedAccountNumber}</div>
                </div>
              )}
            </GlassCard>
          </div>
        </div>
      )}
    </div>
  );
}
