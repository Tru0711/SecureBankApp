  import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchWallet, fetchBalance, fetchTransactions } from '../../store/walletSlice';
import GlassCard from '../../components/common/GlassCard';
import StatusBadge from '../../components/common/StatusBadge';
import AmountDisplay from '../../components/common/AmountDisplay';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import RecentRequestsCard from '../../components/dashboard/RecentRequestsCard';
import EmptyState from '../../components/common/EmptyState';


export default function DashboardPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { wallet, balance, transactions, status } = useSelector((s) => s.wallet);
  const { user } = useSelector((s) => s.auth);

  useEffect(() => {
    dispatch(fetchWallet());
    dispatch(fetchBalance());
    dispatch(fetchTransactions({ limit: 5 }));
  }, [dispatch]);

  const loading = status === 'loading' || !wallet;
  const recentTxns = transactions?.slice(0, 5) || [];

  const getStatusIcon = (type) => {
    switch (type) {
      case 'DEPOSIT': return 'bi-arrow-down-circle';
      case 'TRANSFER': return 'bi-arrow-left-right';
      case 'WITHDRAWAL': return 'bi-arrow-up-circle';
      default: return 'bi-circle';
    }
  };

  const onboardingStep = (() => {
    switch (user?.accountStatus) {
      case 'PROFILE_INCOMPLETE':
      case 'EMAIL_PENDING':
        return { step: 1, label: 'Complete Profile', cta: () => navigate('/onboarding/profile'), active: true };
      case 'BANK_DETAILS_PENDING':
        return { step: 2, label: 'Add Bank Account', cta: () => navigate('/onboarding/bank'), active: true };
      case 'KYC_PENDING':
      case 'ADMIN_REVIEW_PENDING':
        return { step: 3, label: 'Complete KYC', cta: () => navigate('/onboarding/kyc'), active: false };
      case 'ACTIVE':
        return { step: 4, label: 'Start Using Wallet', cta: () => navigate('/wallet'), active: true };
      default:
        return null;
    }
  })();

  const canUseWallet = user?.accountStatus === 'ACTIVE';
  const dashboardActions = [
    {
      title: 'Manage Bank Accounts',
      description: 'Add, edit, remove, or set your default linked bank account.',
      icon: 'bi-bank',
      path: '/profile',
      button: 'Open Banks',
      status: 'PIN protected'
    },
    {
      title: 'Transaction PIN',
      description: 'Create, verify, change, or reset your Transaction PIN.',
      icon: 'bi-key',
      path: '/security-center',
      button: user?.hasTransactionPin ? 'Manage PIN' : 'Set PIN',
      status: user?.hasTransactionPin ? 'Enabled' : 'Not set'
    },
    {
      title: 'Security Activity Logs',
      description: 'Review PIN changes, bank changes, lockouts, and failed attempts.',
      icon: 'bi-shield-check',
      path: '/security-center',
      button: 'View Logs',
      status: 'Audited'
    },
    {
      title: 'Secure Add Money',
      description: 'Fund your wallet from a linked bank with Transaction PIN verification.',
      icon: 'bi-wallet2',
      path: '/wallet/add',
      button: 'Add Money',
      status: canUseWallet ? 'Ready' : 'KYC required',
      disabled: !canUseWallet
    }
  ];

  return (
    <div>
      {/* Welcome + Balance */}
      <div className="page-hero p-4 p-lg-5 mb-4">
        <div className="row align-items-center">
          <div className="col-lg-7 mb-3 mb-lg-0">
            <p className="text-muted-sp mb-1 small">Welcome back,</p>
            <h2 className="fw-bold">{user?.firstName} {user?.lastName}</h2>

            {!canUseWallet && onboardingStep && (
              <div className="alert alert-warning mt-3 py-2 small mb-2" style={{ borderColor: 'var(--sp-border)' }}>
                Your KYC is {user?.accountStatus === 'ADMIN_REVIEW_PENDING' ? 'under review' : 'not completed yet'}. Financial services will be enabled after approval.
              </div>
            )}

            {balance && canUseWallet && (
              <div className="mt-3">
                <small className="text-muted-sp text-uppercase">Available Balance</small>
                <h1 className="fw-bold display-5" style={{ color: 'var(--sp-primary)' }}>
                  <AmountDisplay amount={balance.availableBalance || balance.balance} />
                </h1>
              </div>
            )}
          </div>
          <div className="col-lg-5 d-flex gap-3 justify-content-lg-end">
            <button className="btn btn-sp-primary px-4 py-2" onClick={() => navigate('/wallet/add')} disabled={!canUseWallet}>
              <i className="bi bi-plus-circle me-2" />Add Money
            </button>
            <button className="btn btn-sp-outline px-4 py-2" onClick={() => navigate('/wallet/send')} disabled={!canUseWallet}>
              <i className="bi bi-send me-2" />Send
            </button>
          </div>
        </div>

        {onboardingStep && !canUseWallet && (
          <div className="mt-4">
            <div className="soft-card p-3" style={{ border: '1px solid var(--sp-border)' }}>
              <div className="d-flex align-items-center justify-content-between gap-3 flex-wrap">
                <div>
                  <div className="text-muted-sp small">Onboarding progress</div>
                  <div className="fw-bold">Step {onboardingStep.step} of 4: {onboardingStep.label}</div>
                </div>
                <button className="btn btn-sp-outline" onClick={onboardingStep.cta}>
                  Continue
                </button>
              </div>
            </div>
          </div>
        )}
      </div>


      {/* Financial Summary */}
      <div className="row g-4 mb-4">
        <div className="col-md-4">
          <GlassCard className="p-4 h-100">
            <div className="text-muted-sp small">Available Balance</div>
            <div className="fw-bold mt-2" style={{ color: 'var(--sp-primary)' }}>
              <AmountDisplay amount={balance?.availableBalance || balance?.balance || 0} />
            </div>
          </GlassCard>
        </div>
        <div className="col-md-4">
          <GlassCard className="p-4 h-100">
            <div className="text-muted-sp small">Total Income</div>
            <div className="fw-bold mt-2" style={{ color: 'var(--sp-success)' }}>
              <AmountDisplay amount={wallet?.totalIncome || 0} />
            </div>
          </GlassCard>
        </div>
        <div className="col-md-4">
          <GlassCard className="p-4 h-100">
            <div className="text-muted-sp small">Total Expense</div>
            <div className="fw-bold mt-2" style={{ color: 'var(--sp-danger)' }}>
              <AmountDisplay amount={wallet?.totalExpense || 0} />
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Security + Bank Controls */}
      <div className="mb-4">
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-3">
          <div>
            <h5 className="fw-bold mb-1">Security & Bank Controls</h5>
            <div className="text-muted-sp small">Transaction PIN protected actions and account security tools.</div>
          </div>
          <button className="btn btn-sm btn-sp-outline" onClick={() => navigate('/profile/security')}>
            Security Settings <i className="bi bi-arrow-right ms-1" />
          </button>
        </div>
        <div className="row g-4">
          {dashboardActions.map((action) => (
            <div className="col-md-6 col-xl-3" key={action.title}>
              <GlassCard className="p-4 h-100">
                <div className="d-flex align-items-start justify-content-between gap-3 mb-3">
                  <div
                    className="d-inline-flex align-items-center justify-content-center rounded-circle"
                    style={{ width: 44, height: 44, background: 'rgba(46, 196, 182, 0.14)', color: 'var(--sp-primary)' }}
                  >
                    <i className={`bi ${action.icon}`} />
                  </div>
                  <span className={`status-pill badge-soft-${action.disabled ? 'warning' : 'success'}`}>
                    {action.status}
                  </span>
                </div>
                <h6 className="fw-bold mb-2">{action.title}</h6>
                <p className="text-muted-sp small mb-4">{action.description}</p>
                <button
                  className="btn btn-sp-outline w-100"
                  onClick={() => navigate(action.path)}
                  disabled={action.disabled}
                >
                  {action.button}
                </button>
              </GlassCard>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Requests */}
      <div className="mb-4">
        <RecentRequestsCard />
      </div>

      {/* Recent Transactions */}
      <GlassCard>
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h5 className="fw-bold mb-0">Recent Transactions</h5>
          <button className="btn btn-sm btn-sp-outline" onClick={() => navigate('/transactions')}>
            View All <i className="bi bi-arrow-right ms-1" />
          </button>
        </div>
        {loading ? (
          <LoadingSpinner size="sm" text="Loading transactions..." />
        ) : recentTxns.length === 0 ? (
          <EmptyState
            icon="bi-arrow-left-right"
            title="No transactions yet"
            message="Start by adding money or sending a payment"
            action={{ label: 'Add Money', onClick: () => navigate('/wallet/add') }}
          />
        ) : (
          <div className="table-responsive">
            <table className="table table-dark-sp mb-0">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>ID</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentTxns.map((txn) => (
                  <tr key={txn._id} role="button" onClick={() => navigate(`/transactions/${txn._id}`)}>
                    <td>
                      <i className={`${getStatusIcon(txn.type)} me-2`} />
                      {txn.type}
                    </td>
                    <td className="text-muted-sp small">{txn.transactionId}</td>
                    <td className="fw-bold"><AmountDisplay amount={txn.amount} /></td>
                    <td><StatusBadge status={txn.status} /></td>
                    <td className="text-muted-sp small">{new Date(txn.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
