import React, { useEffect, useMemo, useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import GlassCard from '../../components/common/GlassCard';
import FormInput from '../../components/common/FormInput';
import StatusBadge from '../../components/common/StatusBadge';
import EmptyState from '../../components/common/EmptyState';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { userApi } from '../../services/userApi';
import useAsyncItems from '../../hooks/useAsyncItems';
import useFormState from '../../hooks/useFormState';

const blank = { subject: '', category: 'GENERAL', priority: 'MEDIUM', message: '' };

const formatDate = (value) => (value ? new Date(value).toLocaleString() : '-');

export default function SupportTicketsPage() {
  const { items, loading, error, setError, load } = useAsyncItems(userApi.listSupportTickets, 'Unable to load support tickets');
  const { form, change, reset } = useFormState(blank);
  const [selectedId, setSelectedId] = useState('');
  const [replyText, setReplyText] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!selectedId && items[0]?._id) {
      setSelectedId(items[0]._id);
    }
  }, [items, selectedId]);

  const filteredItems = useMemo(() => {
    return items.filter((ticket) => {
      const matchesSearch = !search || `${ticket.subject} ${ticket.category}`.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || ticket.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [items, search, statusFilter]);

  const selectedTicket = items.find((ticket) => ticket._id === selectedId) || filteredItems[0] || null;

  const create = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const res = await userApi.createSupportTicket(form);
      reset();
      await load();
      setSelectedId(res.data.ticket._id);
      setMessage('Support ticket created');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to create support ticket');
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
      await userApi.replySupportTicket(selectedTicket._id, replyText.trim());
      setReplyText('');
      await load();
      setMessage('Reply added');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to reply to this ticket');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader title="Support Tickets" subtitle="Create tickets, reply, and track support status." />
      {message && <div className="alert alert-success py-2 small">{message}</div>}
      {error && <div className="alert alert-danger py-2 small">{error}</div>}

      <div className="row g-4">
        <div className="col-xl-4">
          <GlassCard className="mb-4">
            <h5 className="fw-bold mb-3">Create Ticket</h5>
            <form onSubmit={create}>
              <FormInput label="Subject" name="subject" value={form.subject} onChange={change} required />
              <div className="mb-3">
                <label className="form-label fw-semibold text-muted-sp">Category</label>
                <select name="category" className="form-select" value={form.category} onChange={change}>
                  <option value="GENERAL">General</option>
                  <option value="ACCOUNT">Account</option>
                  <option value="PAYMENT">Payment</option>
                  <option value="KYC">KYC</option>
                  <option value="SECURITY">Security</option>
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold text-muted-sp">Priority</label>
                <select name="priority" className="form-select" value={form.priority} onChange={change}>
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold text-muted-sp">Message</label>
                <textarea
                  name="message"
                  className="form-control"
                  rows={4}
                  value={form.message}
                  onChange={change}
                  required
                />
              </div>
              <button className="btn btn-sp-primary w-100" type="submit" disabled={saving}>
                {saving ? 'Creating...' : 'Create Ticket'}
              </button>
            </form>
          </GlassCard>

          <GlassCard>
            <div className="d-flex align-items-center justify-content-between gap-2 mb-3">
              <h5 className="fw-bold mb-0">My Tickets</h5>
              <StatusBadge status={items.length ? 'OPEN' : 'CLOSED'} />
            </div>
            <input
              className="form-control mb-2"
              placeholder="Search tickets"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select className="form-select mb-3" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="ALL">All statuses</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>

            {loading ? (
              <LoadingSpinner size="sm" text="Loading tickets..." />
            ) : filteredItems.length === 0 ? (
              <EmptyState icon="bi-life-preserver" title="No tickets" message="Create a support ticket when you need help." />
            ) : (
              <div className="d-flex flex-column gap-2">
                {filteredItems.map((ticket) => (
                  <button
                    key={ticket._id}
                    type="button"
                    className={`soft-card p-3 text-start border-0 ${selectedTicket?._id === ticket._id ? 'shadow-sm' : ''}`}
                    onClick={() => setSelectedId(ticket._id)}
                  >
                    <div className="d-flex justify-content-between gap-2">
                      <div className="fw-bold">{ticket.subject}</div>
                      <StatusBadge status={ticket.status} />
                    </div>
                    <div className="text-muted-sp small mt-1">{ticket.category} - {ticket.priority}</div>
                    <div className="text-muted-sp small">{formatDate(ticket.updatedAt)}</div>
                  </button>
                ))}
              </div>
            )}
          </GlassCard>
        </div>

        <div className="col-xl-8">
          <GlassCard className="h-100">
            {!selectedTicket ? (
              <EmptyState icon="bi-chat-dots" title="No ticket selected" message="Select or create a ticket to view the conversation." />
            ) : (
              <>
                <div className="d-flex flex-wrap align-items-start justify-content-between gap-3">
                  <div>
                    <h4 className="fw-bold mb-1">{selectedTicket.subject}</h4>
                    <div className="text-muted-sp small">
                      {selectedTicket.category} - {selectedTicket.priority} - Created {formatDate(selectedTicket.createdAt)}
                    </div>
                  </div>
                  <StatusBadge status={selectedTicket.status} />
                </div>

                <hr style={{ borderColor: 'var(--sp-border)' }} />

                <div className="d-flex flex-column gap-3 mb-4">
                  {(selectedTicket.messages || []).map((ticketMessage) => (
                    <div
                      key={ticketMessage._id || ticketMessage.createdAt}
                      className={`soft-card p-3 ${ticketMessage.senderRole === 'USER' ? '' : 'ms-lg-5'}`}
                    >
                      <div className="d-flex justify-content-between gap-3 mb-1">
                        <div className="fw-bold small">{ticketMessage.senderRole === 'ADMIN' ? 'SecurePay Support' : 'You'}</div>
                        <div className="text-muted-sp small">{formatDate(ticketMessage.createdAt)}</div>
                      </div>
                      <div className="text-muted-sp small">{ticketMessage.message}</div>
                    </div>
                  ))}
                </div>

                {selectedTicket.status === 'CLOSED' ? (
                  <div className="alert alert-secondary py-2 small mb-0">This ticket is closed. Create a new ticket if you need more help.</div>
                ) : (
                  <div className="d-flex flex-column flex-md-row gap-2">
                    <textarea
                      className="form-control"
                      rows={2}
                      placeholder="Write a reply"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                    />
                    <button className="btn btn-sp-primary px-4" onClick={reply} disabled={saving || !replyText.trim()}>
                      Reply
                    </button>
                  </div>
                )}
              </>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
