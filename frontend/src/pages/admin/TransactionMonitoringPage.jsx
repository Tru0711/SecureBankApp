import React, { useEffect, useMemo, useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import GlassCard from '../../components/common/GlassCard';
import MetricCard from '../../components/common/MetricCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import StatusBadge from '../../components/common/StatusBadge';
import AmountDisplay from '../../components/common/AmountDisplay';
import { adminApi } from '../../services/adminApi';
import { formatDateTime, getRiskClass, getRiskLevel, getUserName } from '../../utils/adminFormat';

const filters = [
  { label: 'All', value: 'ALL' },
  { label: 'Success', value: 'SUCCESS' },
  { label: 'Failed', value: 'FAILED' },
  { label: 'Flagged', value: 'FLAGGED' },
  { label: 'Large Amount', value: 'LARGE_AMOUNT' }
];

export default function TransactionMonitoringPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    (async () => {
      try {
        const res = await adminApi.getTransactions({ limit: 100 });
        setItems(res.data.items || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load transactions');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const overview = useMemo(() => {
    const today = new Date().toDateString();
    const todayItems = items.filter((txn) => new Date(txn.createdAt).toDateString() === today);
    return {
      volume: todayItems.reduce((sum, txn) => sum + Number(txn.amount || 0), 0),
      failed: items.filter((txn) => txn.status === 'FAILED').length,
      successful: items.filter((txn) => txn.status === 'SUCCESS').length,
      flagged: items.filter((txn) => txn.isFlagged).length
    };
  }, [items]);

  const visibleItems = useMemo(() => {
    if (filter === 'SUCCESS' || filter === 'FAILED') return items.filter((txn) => txn.status === filter);
    if (filter === 'FLAGGED') return items.filter((txn) => txn.isFlagged);
    if (filter === 'LARGE_AMOUNT') return items.filter((txn) => Number(txn.amount || 0) >= 50000);
    return items;
  }, [filter, items]);

  return (
    <div>
      <PageHeader title="Transactions" subtitle="Financial monitoring center for status, volume, and transaction risk." />
      {error && <div className="alert alert-danger py-2 small">{error}</div>}
      {loading ? <LoadingSpinner text="Loading transactions..." /> : (
        <>
          <div className="row g-3 mb-4">
            <div className="col-md-3 col-6">
              <MetricCard label="Today's Volume" value={<AmountDisplay amount={overview.volume} />} icon="bi-cash-stack" color="var(--sp-primary)" />
            </div>
            <div className="col-md-3 col-6">
              <MetricCard label="Failed Transactions" value={overview.failed} icon="bi-x-circle" color="var(--sp-danger)" />
            </div>
            <div className="col-md-3 col-6">
              <MetricCard label="Successful Transactions" value={overview.successful} icon="bi-check2-circle" color="var(--sp-success)" />
            </div>
            <div className="col-md-3 col-6">
              <MetricCard label="Flagged Transactions" value={overview.flagged} icon="bi-flag" color="var(--sp-warning)" />
            </div>
          </div>

          <GlassCard className="p-4">
            <div className="d-flex flex-wrap gap-2 mb-4">
              {filters.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  className={`btn btn-sm ${filter === item.value ? 'btn-sp-primary' : 'btn-sp-outline'}`}
                  onClick={() => setFilter(item.value)}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {visibleItems.length === 0 ? (
              <EmptyState icon="bi-arrow-left-right" title="No transactions" message="No transaction records match the selected monitoring filter." />
            ) : (
              <div className="table-responsive">
                <table className="table table-dark-sp mb-0 align-middle">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Type</th>
                      <th>Amount</th>
                      <th>Time</th>
                      <th>Status</th>
                      <th>Risk Level</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleItems.map((txn) => {
                      const risk = getRiskLevel(txn.fraudScore, txn.isFlagged);
                      return (
                        <tr key={txn._id}>
                          <td>
                            {getUserName(txn.userId)}
                            <div className="text-muted-sp small">{txn.transactionId || txn._id}</div>
                          </td>
                          <td>{txn.type}</td>
                          <td><AmountDisplay amount={txn.amount} /></td>
                          <td className="text-muted-sp small">{formatDateTime(txn.createdAt)}</td>
                          <td><StatusBadge status={txn.status} /></td>
                          <td className={`fw-bold ${getRiskClass(risk)}`}>{risk}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </GlassCard>
        </>
      )}
    </div>
  );
}
