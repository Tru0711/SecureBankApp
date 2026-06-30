import React, { useEffect, useMemo, useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import GlassCard from '../../components/common/GlassCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import EmptyState from '../../components/common/EmptyState';
import { adminApi } from '../../services/adminApi';

const statusOptions = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
const priorityOptions = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
const formatDate = (value) => (value ? new Date(value).toLocaleString() : '-');
const userLabel = (user) => user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email : 'Unknown user';

export default function SupportTicketsPage() {
  const [items, setItems] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [replyText, setReplyText] = useState('');
  const [filters, setFilters] = useState({ search: '', status: 'ALL', priority: 'ALL', assignedTo: 'ALL' });

  const loadTickets = async () => {
    const res = await adminApi.getTickets(filters);
    const tickets = res.data.items || [];
    setItems(tickets);
    if (!selectedId && tickets[0]?._id) setSelectedId(tickets[0]._id);
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        await loadTickets();
        const users = await adminApi.getUsers({ limit: 200 });
        setAdmins((users.data.items || []).filter((user) => ['ADMIN', 'ANALYST', 'KYC_OFFICER'].includes(user.role)));
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load tickets');
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedTicket = useMemo(() => {
    return items.find((ticket) => ticket._id === selectedId) || items[0] || null;
  }, [items, selectedId]);

  const refresh = async () => {
    try {
      await loadTickets();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to refresh tickets');
    }
  };

  const applyFilters = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await adminApi.getTickets(filters);
      const tickets = res.data.items || [];
      setItems(tickets);
      setSelectedId(tickets[0]?._id || '');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to filter tickets');
    } finally {
      setLoading(false);
    }
  };

  const updateTicket = async (payload, successMessage) => {
    if (!selectedTicket) return;
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const res = await adminApi.updateTicket(selectedTicket._id, payload);
      setItems((prev) => prev.map((ticket) => ticket._id === selectedTicket._id ? res.data.ticket : ticket));
      setMessage(successMessage);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to update ticket');
    } finally {
      setSaving(false);
    }
  };

  const assignTicket = async (assignedTo) => {
    if (!selectedTicket) return;
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const res = await adminApi.assignTicket(selectedTicket._id, { assignedTo });
      setItems((prev) => prev.map((ticket) => ticket._id === selectedTicket._id ? res.data.ticket : ticket));
      setMessage('Ticket assigned');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to assign ticket');
    } finally {
      setSaving(false);
    }
  };

  const reply = async () => {
    if (!selectedTicket || !replyText.trim()) return;
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const res = await adminApi.replyTicket(selectedTicket._id, {
        message: replyText.trim(),
        assignToMe: !selectedTicket.assignedTo
      });
      setItems((prev) => prev.map((ticket) => ticket._id === selectedTicket._id ? res.data.ticket : ticket));
      setReplyText('');
      setMessage('Reply sent');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to send reply');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader title="Support Tickets" subtitle="Review, reply, assign, and resolve user support requests." />
      {message && <div className="alert alert-success py-2 small">{message}</div>}
      {error && <div className="alert alert-danger py-2 small">{error}</div>}

      <GlassCard className="mb-4">
        <form className="row g-3 align-items-end" onSubmit={applyFilters}>
          <div className="col-lg-4">
            <label className="form-label fw-semibold text-muted-sp">Search</label>
            <input
              className="form-control"
              placeholder="Subject, category, or message"
              value={filters.search}
              onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
            />
          </div>
          <div className="col-sm-4 col-lg-2">
            <label className="form-label fw-semibold text-muted-sp">Status</label>
            <select className="form-select" value={filters.status} onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}>
              <option value="ALL">All</option>
              {statusOptions.map((status) => <option key={status} value={status}>{status}</option>)}
            </select>
          </div>
          <div className="col-sm-4 col-lg-2">
            <label className="form-label fw-semibold text-muted-sp">Priority</label>
            <select className="form-select" value={filters.priority} onChange={(e) => setFilters((prev) => ({ ...prev, priority: e.target.value }))}>
              <option value="ALL">All</option>
              {priorityOptions.map((priority) => <option key={priority} value={priority}>{priority}</option>)}
            </select>
          </div>
          <div className="col-sm-4 col-lg-2">
            <label className="form-label fw-semibold text-muted-sp">Assignment</label>
            <select className="form-select" value={filters.assignedTo} onChange={(e) => setFilters((prev) => ({ ...prev, assignedTo: e.target.value }))}>
              <option value="ALL">All</option>
              <option value="UNASSIGNED">Unassigned</option>
              {admins.map((admin) => <option key={admin._id} value={admin._id}>{userLabel(admin)}</option>)}
            </select>
          </div>
          <div className="col-lg-2">
            <button className="btn btn-sp-primary w-100" type="submit">Apply</button>
          </div>
        </form>
      </GlassCard>

      <div className="row g-4">
        <div className="col-xl-7">
          <GlassCard>
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h5 className="fw-bold mb-0">Ticket Queue</h5>
              <button className="btn btn-sm btn-sp-outline" onClick={refresh} disabled={loading}>Refresh</button>
            </div>
            {loading ? (
              <LoadingSpinner text="Loading tickets..." />
            ) : items.length === 0 ? (
              <EmptyState icon="bi-life-preserver" title="No tickets" message="No support tickets match the current filters." />
            ) : (
              <div className="table-responsive">
                <table className="table table-dark-sp mb-0 align-middle">
                  <thead>
                    <tr>
                      <th>Subject</th>
                      <th>User</th>
                      <th>Status</th>
                      <th>Priority</th>
                      <th>Assigned</th>
                      <th>Updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((ticket) => (
                      <tr key={ticket._id} role="button" onClick={() => setSelectedId(ticket._id)}>
                        <td className="fw-semibold">{ticket.subject}</td>
                        <td className="text-muted-sp small">{ticket.userId?.email || '-'}</td>
                        <td><StatusBadge status={ticket.status} /></td>
                        <td><StatusBadge status={ticket.priority} /></td>
                        <td className="text-muted-sp small">{ticket.assignedTo ? userLabel(ticket.assignedTo) : 'Unassigned'}</td>
                        <td className="text-muted-sp small">{formatDate(ticket.updatedAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </GlassCard>
        </div>

        <div className="col-xl-5">
          <GlassCard className="h-100">
            {!selectedTicket ? (
              <EmptyState icon="bi-chat-square-text" title="No ticket selected" message="Select a ticket from the queue to manage it." />
            ) : (
              <>
                <div className="d-flex justify-content-between gap-3 mb-3">
                  <div>
                    <h5 className="fw-bold mb-1">{selectedTicket.subject}</h5>
                    <div className="text-muted-sp small">{selectedTicket.userId?.email} - {selectedTicket.category}</div>
                  </div>
                  <StatusBadge status={selectedTicket.status} />
                </div>

                <div className="row g-2 mb-3">
                  <div className="col-sm-6">
                    <label className="form-label text-muted-sp small">Status</label>
                    <select
                      className="form-select"
                      value={selectedTicket.status}
                      onChange={(e) => updateTicket({ status: e.target.value }, 'Status updated')}
                      disabled={saving}
                    >
                      {statusOptions.map((status) => <option key={status} value={status}>{status}</option>)}
                    </select>
                  </div>
                  <div className="col-sm-6">
                    <label className="form-label text-muted-sp small">Priority</label>
                    <select
                      className="form-select"
                      value={selectedTicket.priority}
                      onChange={(e) => updateTicket({ priority: e.target.value }, 'Priority updated')}
                      disabled={saving}
                    >
                      {priorityOptions.map((priority) => <option key={priority} value={priority}>{priority}</option>)}
                    </select>
                  </div>
                  <div className="col-12">
                    <label className="form-label text-muted-sp small">Assign To</label>
                    <select
                      className="form-select"
                      value={selectedTicket.assignedTo?._id || ''}
                      onChange={(e) => assignTicket(e.target.value)}
                      disabled={saving}
                    >
                      <option value="">Assign to me</option>
                      {admins.map((admin) => <option key={admin._id} value={admin._id}>{userLabel(admin)} - {admin.role}</option>)}
                    </select>
                  </div>
                </div>

                <div className="d-flex flex-wrap gap-2 mb-3">
                  <button className="btn btn-sm btn-sp-outline" onClick={() => updateTicket({ status: 'CLOSED' }, 'Ticket closed')} disabled={saving || selectedTicket.status === 'CLOSED'}>
                    Close
                  </button>
                  <button className="btn btn-sm btn-sp-outline" onClick={() => updateTicket({ status: 'OPEN' }, 'Ticket reopened')} disabled={saving || selectedTicket.status !== 'CLOSED'}>
                    Reopen
                  </button>
                  <button className="btn btn-sm btn-sp-primary" onClick={() => updateTicket({ status: 'RESOLVED' }, 'Ticket resolved')} disabled={saving || selectedTicket.status === 'RESOLVED'}>
                    Mark Resolved
                  </button>
                </div>

                <hr style={{ borderColor: 'var(--sp-border)' }} />

                <div className="d-flex flex-column gap-2 mb-3" style={{ maxHeight: 360, overflowY: 'auto' }}>
                  {(selectedTicket.messages || []).map((ticketMessage) => (
                    <div key={ticketMessage._id || ticketMessage.createdAt} className="soft-card p-3">
                      <div className="d-flex justify-content-between gap-2">
                        <div className="fw-bold small">{ticketMessage.senderRole === 'ADMIN' ? 'Admin' : 'User'}</div>
                        <div className="text-muted-sp small">{formatDate(ticketMessage.createdAt)}</div>
                      </div>
                      <div className="text-muted-sp small mt-1">{ticketMessage.message}</div>
                    </div>
                  ))}
                </div>

                <textarea
                  className="form-control mb-2"
                  rows={3}
                  placeholder="Reply to user"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                />
                <button className="btn btn-sp-primary w-100" onClick={reply} disabled={saving || !replyText.trim()}>
                  {saving ? 'Saving...' : 'Send Reply'}
                </button>
              </>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
