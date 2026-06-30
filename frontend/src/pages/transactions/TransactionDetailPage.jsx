import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { loadTransactionDetails, clearSelectedTransaction } from '../../store/transactionSlice';
import PageHeader from '../../components/common/PageHeader';
import GlassCard from '../../components/common/GlassCard';
import StatusBadge from '../../components/common/StatusBadge';
import AmountDisplay from '../../components/common/AmountDisplay';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function TransactionDetailPage() {
  const dispatch = useDispatch();
  const params = useParams();
  const transactionId = params.id;
  const navigate = useNavigate();
  const { selectedTransaction, status } = useSelector((s) => s.transaction);

  useEffect(() => {
    dispatch(loadTransactionDetails(transactionId));
    return () => dispatch(clearSelectedTransaction());
  }, [dispatch, transactionId]);

  const txn = selectedTransaction;
  const loading = status === 'loading';

  // Debug guard (remove after verification)
  if (!transactionId) {
    return (
      <div>
        <PageHeader title="Transaction Details" subtitle="ID: missing">
          <button className="btn btn-sp-outline px-3" onClick={() => navigate('/transactions')}>
            <i className="bi bi-arrow-left me-2" />Back
          </button>
        </PageHeader>
        <GlassCard className="text-center py-5">
          <i className="bi bi-exclamation-circle display-4 mb-3" style={{ color: 'var(--sp-warning)' }} />
          <p className="text-muted-sp">Transaction ID is missing from the route.</p>
        </GlassCard>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Transaction Details" subtitle={`ID: ${transactionId}`}>

        <button className="btn btn-sp-outline px-3" onClick={() => navigate('/transactions')}>
          <i className="bi bi-arrow-left me-2" />Back
        </button>
      </PageHeader>

      {loading ? (
        <LoadingSpinner text="Loading details..." />
      ) : !txn ? (
        <GlassCard className="text-center py-5">
          <i className="bi bi-exclamation-circle display-4 mb-3" style={{ color: 'var(--sp-warning)' }} />
          <p className="text-muted-sp">Transaction not found</p>
        </GlassCard>
      ) : (
        <div className="row g-4">
          <div className="col-lg-6">
            <GlassCard>
              <div className="text-center mb-4">
                <div
                  className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
                  style={{ width: 72, height: 72, background: 'rgba(77,212,198,0.12)' }}
                >
                  <i className={`bi ${txn.type === 'DEPOSIT' ? 'bi-arrow-down-circle' : 'bi-arrow-left-right'} fs-2`} style={{ color: 'var(--sp-primary)' }} />
                </div>
                <h2 className="fw-bold">
                  <AmountDisplay amount={txn.amount} />
                </h2>
                <StatusBadge status={txn.status} />
              </div>

              <hr style={{ borderColor: 'var(--sp-border)' }} />

              <div className="d-flex flex-column gap-3">
                <div className="d-flex justify-content-between">
                  <span className="text-muted-sp">Type</span>
                  <span className="fw-bold">{txn.type}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-muted-sp">Transaction ID</span>
                  <span className="small">{txn.transactionId}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-muted-sp">Created</span>
                  <span>{new Date(txn.createdAt).toLocaleString('en-IN')}</span>
                </div>
                {txn.completedAt && (
                  <div className="d-flex justify-content-between">
                    <span className="text-muted-sp">Completed</span>
                    <span>{new Date(txn.completedAt).toLocaleString('en-IN')}</span>
                  </div>
                )}
              </div>
            </GlassCard>
          </div>

          <div className="col-lg-6">
            <GlassCard>
              <h5 className="fw-bold mb-3">Parties</h5>
              <div className="mb-3">
                <small className="text-muted-sp d-block mb-1">Sender</small>
                <p className="fw-bold mb-0">{txn.sender?.firstName || 'You'}</p>
                <small className="text-muted-sp">{txn.sender?.email || ''}</small>
              </div>
              <div className="mb-3">
                <small className="text-muted-sp d-block mb-1">Receiver</small>
                <p className="fw-bold mb-0">{txn.receiver?.firstName || '—'}</p>
                <small className="text-muted-sp">{txn.receiver?.email || ''}</small>
              </div>

              <hr style={{ borderColor: 'var(--sp-border)' }} />

              <h5 className="fw-bold mb-3">Security</h5>
              <div className="d-flex flex-column gap-2">
                <div className="d-flex justify-content-between">
                  <span className="text-muted-sp small">Fraud Score</span>
                  <span className={`fw-bold ${txn.fraudScore > 50 ? 'text-danger' : txn.fraudScore > 20 ? 'text-warning' : 'text-success'}`}>
                    {txn.fraudScore || 0}/100
                  </span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-muted-sp small">Flagged</span>
                  <span>
                    {txn.isFlagged ? (
                      <span className="status-pill badge-soft-danger">FLAGGED</span>
                    ) : (
                      <span className="status-pill badge-soft-success">SAFE</span>
                    )}
                  </span>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      )}
    </div>
  );
}
