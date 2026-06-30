import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchWallet, fetchBalance } from '../../store/walletSlice';
import GlassCard from '../../components/common/GlassCard';
import AmountDisplay from '../../components/common/AmountDisplay';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import PageHeader from '../../components/common/PageHeader';

export default function WalletOverviewPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { wallet, balance, status } = useSelector((s) => s.wallet);

  useEffect(() => {
    dispatch(fetchWallet());
    dispatch(fetchBalance());
  }, [dispatch]);

  const loading = status === 'loading';

  return (
    <div>
      <PageHeader
        title="Wallet"
        subtitle="Manage your digital wallet"
      >
        <button className="btn btn-sp-primary px-4" onClick={() => navigate('/wallet/add')}>
          <i className="bi bi-plus-circle me-2" />Add Money
        </button>
        <button className="btn btn-sp-outline px-4" onClick={() => navigate('/wallet/send')}>
          <i className="bi bi-send me-2" />Send
        </button>
      </PageHeader>

      {loading ? (
        <LoadingSpinner text="Loading wallet..." />
      ) : (
        <div className="row g-4">
          <div className="col-lg-6">
            <GlassCard className="h-100">
              <div className="d-flex align-items-center gap-3 mb-3">
                <i className="bi bi-wallet2 fs-2" style={{ color: 'var(--sp-primary)' }} />
                <div>
                  <h5 className="fw-bold mb-0">Available Balance</h5>
                  <small className="text-muted-sp">Your spendable balance</small>
                </div>
              </div>
              <h1 className="fw-bold display-5" style={{ color: 'var(--sp-primary)' }}>
                <AmountDisplay amount={balance?.availableBalance || balance?.balance || 0} />
              </h1>
              <div className="mt-3 d-flex gap-3 text-muted-sp small">
                <span>Currency: {balance?.currency || wallet?.currency || 'INR'}</span>
                <span className="d-flex align-items-center gap-1">
                  Status:
                  <span className={`status-pill badge-soft-${wallet?.status === 'ACTIVE' ? 'success' : 'warning'}`}>
                    {wallet?.status}
                  </span>
                </span>
              </div>
            </GlassCard>
          </div>

          <div className="col-lg-6">
            <GlassCard className="h-100">
              <h5 className="fw-bold mb-3">Wallet Details</h5>
              <div className="d-flex flex-column gap-3">
                <div className="d-flex justify-content-between">
                  <span className="text-muted-sp">Total Balance</span>
                  <span className="fw-bold"><AmountDisplay amount={wallet?.balance || 0} /></span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-muted-sp">Locked Amount</span>
                  <span className="fw-bold"><AmountDisplay amount={wallet?.lockedAmount || 0} /></span>
                </div>
                <hr style={{ borderColor: 'var(--sp-border)' }} />
                <div className="d-flex justify-content-between">
                  <span className="text-muted-sp">Total Income</span>
                  <span className="fw-bold" style={{ color: 'var(--sp-success)' }}>
                    <AmountDisplay amount={wallet?.totalIncome || 0} />
                  </span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-muted-sp">Total Expense</span>
                  <span className="fw-bold" style={{ color: 'var(--sp-danger)' }}>
                    <AmountDisplay amount={wallet?.totalExpense || 0} />
                  </span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-muted-sp">Total Transfers</span>
                  <span className="fw-bold">{wallet?.totalTransfers || 0}</span>
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Quick Actions */}
          <div className="col-12">
            <GlassCard>
              <h5 className="fw-bold mb-3">Quick Actions</h5>
              <div className="row g-3">
                <div className="col-sm-4">
                  <button className="btn btn-sp-outline w-100 py-3 d-flex flex-column align-items-center gap-2" onClick={() => navigate('/wallet/add')}>
                    <i className="bi bi-plus-circle fs-3" style={{ color: 'var(--sp-success)' }} />
                    <span className="fw-semibold">Add Money</span>
                  </button>
                </div>
                <div className="col-sm-4">
                  <button className="btn btn-sp-outline w-100 py-3 d-flex flex-column align-items-center gap-2" onClick={() => navigate('/wallet/send')}>
                    <i className="bi bi-send fs-3" style={{ color: 'var(--sp-primary)' }} />
                    <span className="fw-semibold">Send Money</span>
                  </button>
                </div>
                <div className="col-sm-4">
                  <button className="btn btn-sp-outline w-100 py-3 d-flex flex-column align-items-center gap-2" onClick={() => navigate('/wallet/receive')}>
                    <i className="bi bi-inbox fs-3" style={{ color: 'var(--sp-primary-2)' }} />
                    <span className="fw-semibold">Receive Money</span>
                  </button>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      )}
    </div>
  );
}
