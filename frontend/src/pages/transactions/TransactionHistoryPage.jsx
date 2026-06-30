import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchTransactions } from '../../store/walletSlice';
import { setTransactionFilters } from '../../store/transactionSlice';
import PageHeader from '../../components/common/PageHeader';
import GlassCard from '../../components/common/GlassCard';
import StatusBadge from '../../components/common/StatusBadge';
import AmountDisplay from '../../components/common/AmountDisplay';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { TRANSACTION_TYPES, TRANSACTION_STATUS } from '../../utils/constants';

export default function TransactionHistoryPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { transactions, pagination, status } = useSelector((s) => s.wallet);
  const { filters } = useSelector((s) => s.transaction);
  const [page, setPage] = useState(1);

  useEffect(() => {
    // Backend only supports type/status filters. Normalize UI 'all' values to avoid empty results.
    const normalizedFilters = {
      ...filters,
      type: filters.type && filters.type !== 'all' ? filters.type : undefined,
      status: filters.status && filters.status !== 'all' ? filters.status : undefined,
      // search is UI-only (backend does not use it)
      search: undefined
    };

    dispatch(fetchTransactions({ page, limit: 10, ...normalizedFilters }));
  }, [dispatch, page, filters]);


  const handleFilterChange = (key, value) => {
    dispatch(setTransactionFilters({ [key]: value }));
    setPage(1);
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'DEPOSIT': return 'bi-arrow-down-circle text-success';
      case 'TRANSFER': return 'bi-arrow-left-right text-info';
      case 'WITHDRAWAL': return 'bi-arrow-up-circle text-danger';
      default: return 'bi-circle text-muted';
    }
  };

  return (
    <div>
      <PageHeader title="Transaction History" subtitle="View all your transactions">
        <button
          className="btn btn-sm btn-sp-outline"
          onClick={() => { dispatch(setTransactionFilters({ search: '', status: 'all', type: 'all' })); setPage(1); }}
        >
          <i className="bi bi-arrow-counterclockwise me-1" /> Reset
        </button>
      </PageHeader>

      {/* Filters */}
      <GlassCard className="mb-4">
        <div className="row g-3 align-items-end">
          <div className="col-md-4">
            <label className="form-label small text-muted-sp fw-semibold">Search</label>
            <div className="input-group">
              <span className="input-group-text" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--sp-border)', color: 'var(--sp-text-muted)' }}>
                <i className="bi bi-search" />
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Search by ID or email..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-3">
            <label className="form-label small text-muted-sp fw-semibold">Type</label>
            <select className="form-select" value={filters.type} onChange={(e) => handleFilterChange('type', e.target.value)}>
              <option value="all">All Types</option>
              {Object.keys(TRANSACTION_TYPES).map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div className="col-md-3">
            <label className="form-label small text-muted-sp fw-semibold">Status</label>
            <select className="form-select" value={filters.status} onChange={(e) => handleFilterChange('status', e.target.value)}>
              <option value="all">All Status</option>
              {Object.keys(TRANSACTION_STATUS).map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="col-md-2 d-grid">
            <button className="btn btn-sp-primary" onClick={() => dispatch(fetchTransactions({ page: 1, limit: 10, ...filters }))}>
              <i className="bi bi-funnel me-1" /> Filter
            </button>
          </div>
        </div>
      </GlassCard>

      {/* Transactions Table */}
      {status === 'loading' ? (
        <LoadingSpinner text="Loading transactions..." />
      ) : transactions.length === 0 ? (
        <EmptyState
          icon="bi-arrow-left-right"
          title="No transactions found"
          message="Try changing your filters or make your first transaction"
          action={{ label: 'Send Money', onClick: () => navigate('/wallet/send') }}
        />
      ) : (
        <>
          <GlassCard>
            <div className="table-responsive">
              <table className="table table-dark-sp mb-0">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Transaction ID</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Description</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((txn) => (
                    <tr
                      key={txn._id}
                      role="button"
                      onClick={() => navigate(`/transactions/${txn._id}`)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td>
                        <i className={`${getTypeIcon(txn.type)} me-2`} />
                        {txn.type}
                      </td>
                      <td className="small text-muted-sp">{txn.transactionId}</td>
                      <td className="fw-bold"><AmountDisplay amount={txn.amount} /></td>
                      <td><StatusBadge status={txn.status} /></td>
                      <td className="small text-muted-sp">{txn.description || '—'}</td>
                      <td className="small text-muted-sp">
                        {new Date(txn.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="d-flex justify-content-center mt-4 gap-2">
              <button
                className="btn btn-sp-outline btn-sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <i className="bi bi-chevron-left me-1" /> Previous
              </button>
              <span className="d-flex align-items-center px-3 text-muted-sp small">
                Page {pagination.page} of {pagination.pages}
              </span>
              <button
                className="btn btn-sp-outline btn-sm"
                disabled={page >= pagination.pages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next <i className="bi bi-chevron-right ms-1" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
