 import React from 'react';
import { useSelector } from 'react-redux';
import GlassCard from '../../components/common/GlassCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import StatusBadge from '../../components/common/StatusBadge';
import AmountDisplay from '../../components/common/AmountDisplay';
import { useNavigate } from 'react-router-dom';

// Lightweight card: consumes requests from redux if available.
// This app currently fetches money requests in MoneyRequestsPage.
// For production behavior without new APIs, this card falls back to empty state.

export default function RecentRequestsCard({ items, loading = false, error = '' }) {
  const navigate = useNavigate();

  const { items: reduxItems, status } = useSelector((s) => s.moneyRequests || { items: [], status: 'idle' });

  const list = Array.isArray(items) ? items : (Array.isArray(reduxItems) ? reduxItems : []);
  const effectiveLoading = loading || status === 'loading';
  const effectiveError = error || (status === 'failed' ? 'Unable to load requests' : '');



  return (
    <GlassCard>
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h5 className="fw-bold mb-0">Recent Requests</h5>
        <button
          className="btn btn-sm btn-sp-outline"
          onClick={() => navigate('/money-requests')}
        >
          View All <i className="bi bi-arrow-right ms-1" />
        </button>
      </div>

      {error ? (
        <div className="alert alert-danger py-2 small mb-0">{error}</div>
      ) : loading ? (
        <LoadingSpinner size="sm" text="Loading requests..." />
      ) : list.length === 0 ? (
        <EmptyState
          icon="bi-arrow-left-right"
          title="No requests yet"
          message="Create a money request to get started."
          action={{ label: 'New Request', onClick: () => navigate('/money-requests') }}
        />
      ) : (
        <div className="d-flex flex-column gap-2">
          {list.slice(0, 5).map((r) => (
            <div key={r._id} className="soft-card p-3">
              <div className="d-flex flex-wrap justify-content-between align-items-start gap-3">
                <div>
                  <div className="fw-bold"><AmountDisplay amount={r.amount} /></div>
                  <div className="text-muted-sp small">{r.description || '-'}</div>
                </div>
                <div className="text-end">
                  <StatusBadge status={r.status} />
                  <div className="text-muted-sp small mt-2">{r.payerEmail ? `From: ${r.payerEmail}` : ''}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </GlassCard>
  );
}

