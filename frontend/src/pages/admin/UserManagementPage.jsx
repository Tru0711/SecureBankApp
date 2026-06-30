import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import GlassCard from '../../components/common/GlassCard';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { adminApi } from '../../services/adminApi';
import { filterUsersByStatus, formatDate, getRiskClass, getRiskLevel, getUserName, userMatchesSearch } from '../../utils/adminFormat';

const filters = [
  { label: 'All', value: 'ALL' },
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Frozen', value: 'FROZEN' },
  { label: 'Banned', value: 'BANNED' },
  { label: 'Pending KYC', value: 'PENDING_KYC' },
  { label: 'Verified', value: 'VERIFIED' }
];

export default function UserManagementPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    (async () => {
      try {
        const res = await adminApi.getUsers({ limit: 100 });
        setUsers(res.data.items || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load users');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const visibleUsers = useMemo(() => {
    return filterUsersByStatus(users, filter).filter((user) => userMatchesSearch(user, search));
  }, [filter, search, users]);

  return (
    <div>
      <PageHeader title="Users" subtitle="User management and investigation across account, KYC, and risk state." />
      {error && <div className="alert alert-danger py-2 small">{error}</div>}
      {loading ? (
        <LoadingSpinner text="Loading users..." />
      ) : (
        <GlassCard className="p-4">
          <div className="d-flex flex-column flex-lg-row gap-3 justify-content-between mb-4">
            <div className="d-flex flex-wrap gap-2">
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
            <div style={{ minWidth: 280 }}>
              <input
                className="form-control"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search name, email, phone, or user ID"
              />
            </div>
          </div>

          {visibleUsers.length === 0 ? (
            <EmptyState icon="bi-people" title="No matching users" message="Adjust the filter or search query to broaden the investigation list." />
          ) : (
            <div className="table-responsive">
              <table className="table table-dark-sp mb-0 align-middle">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>KYC Status</th>
                    <th>Account Status</th>
                    <th>Risk Level</th>
                    <th>Created Date</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {visibleUsers.map((user) => {
                    const risk = getRiskLevel(0, ['FROZEN', 'BANNED', 'REJECTED'].includes(user.accountStatus));
                    return (
                      <tr key={user._id}>
                        <td>{getUserName(user)}</td>
                        <td className="text-muted-sp small">{user.email}</td>
                        <td className="text-muted-sp small">{user.phone || '-'}</td>
                        <td><StatusBadge status={user.kycStatus} /></td>
                        <td><StatusBadge status={user.accountStatus} /></td>
                        <td className={`fw-bold ${getRiskClass(risk)}`}>{risk}</td>
                        <td className="text-muted-sp small">{formatDate(user.createdAt)}</td>
                        <td className="text-end">
                          <button className="btn btn-sm btn-sp-outline" onClick={() => navigate(`/admin/users/${user._id}`)}>
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </GlassCard>
      )}
    </div>
  );
}
