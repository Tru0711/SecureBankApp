import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import GlassCard from '../../components/common/GlassCard';

export default function SecuritySettingsPage() {
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const hasPin = user?.hasTransactionPin || Boolean(user?.transactionPinSetAt);

  return (
    <div>
      <PageHeader title="Security" subtitle="Manage password, devices, and verification settings." />
      <GlassCard className="p-4">
        <div className="row g-3">
          <div className="col-lg-6">
            <div className="glass-card p-4" style={{ borderRadius: 20 }}>
              <h6 className="fw-bold mb-2">Password</h6>
              <p className="text-muted-sp small mb-3">Update your password regularly to keep your account secure.</p>
              <button className="btn btn-sp-outline w-100">Change Password</button>
            </div>
          </div>
          <div className="col-lg-6">
            <div className="glass-card p-4" style={{ borderRadius: 20 }}>
              <h6 className="fw-bold mb-2">Transaction PIN</h6>
              <p className="text-muted-sp small mb-3">
                Status: <strong className={hasPin ? 'text-success' : 'text-danger'}>{hasPin ? 'Enabled' : 'Not Set'}</strong>.
              </p>
              <button className="btn btn-sp-primary w-100" onClick={() => navigate('/security-center')}>
                Manage PIN
              </button>
            </div>
          </div>
          <div className="col-lg-6">
            <div className="glass-card p-4" style={{ borderRadius: 20 }}>
              <h6 className="fw-bold mb-2">Verification</h6>
              <p className="text-muted-sp small mb-3">Ensure your KYC is verified for increased limits.</p>
              <button className="btn btn-sp-outline w-100" onClick={() => navigate('/profile/kyc')}>View KYC Status</button>
            </div>
          </div>
          <div className="col-lg-6">
            <div className="glass-card p-4" style={{ borderRadius: 20 }}>
              <h6 className="fw-bold mb-2">2FA / OTP</h6>
              <p className="text-muted-sp small mb-3">
                OTP verification is required for sensitive actions. Configure advanced protection in future updates.
              </p>
              <button className="btn btn-sp-outline w-100" disabled>Configure 2FA</button>
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}

