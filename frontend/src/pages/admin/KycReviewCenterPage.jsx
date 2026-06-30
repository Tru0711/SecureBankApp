
import React, { useEffect, useMemo, useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import GlassCard from '../../components/common/GlassCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import StatusBadge from '../../components/common/StatusBadge';
import { adminApi } from '../../services/adminApi';
import { formatDateTime, getUserName } from '../../utils/adminFormat';

// Admin queue-only workflow:
// - Main page shows only application list + Review action
// - Sensitive KYC details/documents/verification/approve-reject live only in the review drawer

const REJECTION_REASONS = [

  'PAN Card Not Clear',
  'Aadhaar Card Not Clear',
  'PAN Verification Failed',
  'Aadhaar Verification Failed',
  'Name Mismatch',
  'DOB Mismatch',
  'Face/Selfie Mismatch',
  'Blurred Document',
  'Expired/Invalid Document',
  'Suspicious/Fake Document',
  'Other'
];

function formatPhone(phone) {
  if (phone === null || phone === undefined || phone === '') return '-';
  return String(phone);
}

function formatAddress(address) {
  if (!address) return '-';
  if (typeof address === 'string') return address;

  const parts = [
    address.line1,
    address.line2,
    address.city,
    address.state,
    address.postalCode,
    address.country
  ].filter(Boolean);

  return parts.length ? parts.join(', ') : '-';
}

function DocImage({ src, alt }) {
  if (!src) return null;
  return <img alt={alt} src={src} style={{ width: '100%', maxHeight: 240, objectFit: 'contain' }} />;
}

function DocPreview({ url, label }) {
  if (!url) {
    return (
      <div className="d-flex flex-column gap-1">
        <div className="text-muted-sp">{label}</div>
        <div className="text-muted-sp small">Not uploaded</div>
      </div>
    );
  }

  return (
    <div className="d-flex flex-column gap-2">
      <div className="text-muted-sp small">{label}</div>
      <div>
        <DocImage src={url} alt={label} />
      </div>
      <div className="d-flex flex-wrap gap-2">
        <a className="btn btn-sm btn-sp-outline" href={url} target="_blank" rel="noreferrer">
          View Full Size
        </a>
        <a className="btn btn-sm btn-sp-outline" href={url} download>
          Download
        </a>
      </div>
    </div>
  );
}


function promptRejectionReason() {
  const menu =
    'Select rejection reason:\n' +
    REJECTION_REASONS.map((r, idx) => `${idx + 1}. ${r}`).join('\n') +
    `\n\nEnter 1-${REJECTION_REASONS.length}: `;

  const raw = window.prompt(menu);
  const num = Number(raw);
  const picked = REJECTION_REASONS[Number.isFinite(num) ? num - 1 : -1] ?? null;

  if (!picked) return null;
  if (picked !== 'Other') return picked;

  const other = window.prompt('Enter rejection reason details:');
  return other ? `Other: ${other}` : 'Other';
}

export default function KycReviewCenterPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [activeTab, setActiveTab] = useState('PENDING');

  // Main queue should not show full KYC details. The admin opens a dedicated drawer for one submission.
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [reviewId, setReviewId] = useState(null);

  const [actionMessage, setActionMessage] = useState('');

  const [reviewError, setReviewError] = useState('');
  const [reviewActionMessage, setReviewActionMessage] = useState('');

  const loadKyc = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await adminApi.getKycQueue();
      console.log('[KycReviewCenterPage.loadKyc] res=', res);
      const candidateItems = res?.items ?? res?.data?.items ?? [];
      setItems(Array.isArray(candidateItems) ? candidateItems : []);
      const meta = res?.meta ?? res?.data?.meta;
      if (meta) console.log('[KycReviewCenterPage.loadKyc] meta=', meta);
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to load KYC submissions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadKyc();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pendingLikeStatuses = ['PENDING', 'UNDER_REVIEW', 'REUPLOAD_REQUESTED'];

  const pendingItems = useMemo(
    () => items.filter((i) => pendingLikeStatuses.includes(i.status)),
    [items]
  );
  const approvedItems = useMemo(() => items.filter((i) => i.status === 'APPROVED'), [items]);
  const rejectedItems = useMemo(() => items.filter((i) => i.status === 'REJECTED'), [items]);

  const visibleItems =
    activeTab === 'PENDING' ? pendingItems : activeTab === 'APPROVED' ? approvedItems : rejectedItems;

  const selected = useMemo(() => {
    if (!reviewId) return null;
    return items.find((i) => i._id === reviewId) || null;
  }, [items, reviewId]);

  const openReview = (id) => {
    setReviewError('');
    setReviewActionMessage('');
    setReviewId(id);
    setIsReviewOpen(true);

    // Debug: modal state + received record
    setTimeout(() => {
      const rec = items.find((i) => i._id === id);
      console.log('[KycReviewCenterPage.openReview] id=', id);
      console.log('[KycReviewCenterPage.openReview] record=', rec);
      console.log('[KycReviewCenterPage.openReview] documents=', rec?.documents);
      console.log('[KycReviewCenterPage.openReview] fields=', {
        panNumber: rec?.panNumber,
        aadhaarNumber: rec?.aadhaarNumber,
        address: rec?.address,
        dob: rec?.dob
      });
    }, 0);
  };

  const closeReview = () => {
    setIsReviewOpen(false);
    setReviewId(null);
    setReviewError('');
    setReviewActionMessage('');
  };

  const reviewApprove = async () => {
    if (!selected?._id) return;
    setReviewActionMessage('');
    setReviewError('');
    try {
      await adminApi.reviewKyc(selected._id, { status: 'APPROVED' });
      setReviewActionMessage('KYC approved successfully.');
      await loadKyc();
      closeReview();
      setActionMessage('KYC approved successfully.');
    } catch (err) {
      setReviewError(err?.response?.data?.message || 'Unable to approve KYC');
    }
  };

  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectRemarks, setRejectRemarks] = useState('');

  const openReject = () => {
    setRejectReason('');
    setRejectRemarks('');
    setRejectOpen(true);
  };

  const closeReject = () => {
    setRejectOpen(false);
  };

  const submitReject = async () => {
    if (!selected?._id) return;
    setReviewActionMessage('');
    setReviewError('');

    if (!rejectReason) {
      setReviewError('Rejection reason is required');
      return;
    }
    if (!rejectRemarks.trim()) {
      setReviewError('Admin remarks are required');
      return;
    }

    try {
      await adminApi.reviewKyc(selected._id, {
        status: 'REJECTED',
        reason: rejectReason,
        remarks: rejectRemarks
      });
      setReviewActionMessage('KYC rejected successfully.');
      await loadKyc();
      closeReject();
      closeReview();
      setActionMessage('KYC rejected successfully.');
    } catch (err) {
      setReviewError(err?.response?.data?.message || 'Unable to reject KYC');
    }
  };


  const sidebarCount = {
    PENDING: pendingItems.length,
    APPROVED: approvedItems.length,
    REJECTED: rejectedItems.length
  };

  return (
    <div>
      <PageHeader title="KYC Review" subtitle="Review and decide customer KYC submissions." />

      {error && <div className="alert alert-danger py-2 small">{error}</div>}
      {actionMessage && <div className="alert alert-success py-2 small">{actionMessage}</div>}

      {loading ? (
        <LoadingSpinner text="Loading KYC submissions..." />
      ) : (
        <div className="row g-4">
          <div className="col-xl-3">
            <GlassCard className="p-3">
              <div className="d-flex flex-column gap-2">
                <button
                  type="button"
                  className={`btn btn-sm text-start ${activeTab === 'PENDING' ? 'btn-sp-primary' : 'btn-sp-outline'}`}
                  onClick={() => setActiveTab('PENDING')}
                >
                  <span className="fw-bold">Pending</span>
                  <span className="ms-2 text-muted-sp">({sidebarCount.PENDING})</span>
                </button>
                <button
                  type="button"
                  className={`btn btn-sm text-start ${activeTab === 'APPROVED' ? 'btn-sp-primary' : 'btn-sp-outline'}`}
                  onClick={() => setActiveTab('APPROVED')}
                >
                  <span className="fw-bold">Approved</span>
                  <span className="ms-2 text-muted-sp">({sidebarCount.APPROVED})</span>
                </button>
                <button
                  type="button"
                  className={`btn btn-sm text-start ${activeTab === 'REJECTED' ? 'btn-sp-primary' : 'btn-sp-outline'}`}
                  onClick={() => setActiveTab('REJECTED')}
                >
                  <span className="fw-bold">Rejected</span>
                  <span className="ms-2 text-muted-sp">({sidebarCount.REJECTED})</span>
                </button>
              </div>
            </GlassCard>
          </div>

          <div className="col-xl-9">
            {/* Review Drawer (opens only when admin clicks Review on a specific submission) */}
            {isReviewOpen && selected && (
              <div
                className="modal d-block"
                style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1050 }}
                role="dialog"
                aria-modal="true"
              >
                <div className="modal-dialog modal-dialog-end" style={{ width: 'min(980px, 100%)' }}>
                  <div
                    className="modal-content"
                    style={{ background: 'var(--sp-bg-soft)', color: 'var(--sp-text)', border: '1px solid var(--sp-border)', borderRadius: 18 }}
                  >
                    <div className="modal-header" style={{ borderBottom: '1px solid var(--sp-border)' }}>
                      <div className="d-flex flex-column">
                        <h6 className="fw-bold mb-1">KYC Review</h6>
                        <div className="text-muted-sp small">Review and decide for: {getUserName(selected.userId)}</div>
                      </div>
                      <button type="button" className="btn-close btn-close-white" onClick={closeReview} aria-label="Close" />
                    </div>

                    <div className="modal-body" style={{ maxHeight: '70vh', overflow: 'auto' }}>
                      {reviewError && <div className="alert alert-danger py-2 small">{reviewError}</div>}
                      {reviewActionMessage && <div className="alert alert-success py-2 small">{reviewActionMessage}</div>}

                      <div className="row g-4">
                        <div className="col-lg-6">
                          <GlassCard className="p-3">
                            <h6 className="fw-bold mb-3">User Information</h6>
                            <div className="d-flex flex-column gap-2">
                              <div>
                                <div className="text-muted-sp small">Full Name</div>
                                <div className="fw-semibold">{getUserName(selected.userId)}</div>
                              </div>
                              <div>
                                <div className="text-muted-sp small">Email</div>
                                <div className="fw-semibold">{selected.userId?.email || '-'}</div>
                              </div>
                              <div>
                                <div className="text-muted-sp small">Phone Number</div>
                                <div className="fw-semibold">{formatPhone(selected.userId?.phone)}</div>
                              </div>
                              <div>
                                <div className="text-muted-sp small">Address</div>
                                <div className="fw-semibold">{formatAddress(selected.userId?.address)}</div>
                              </div>
                              <div>
                                <div className="text-muted-sp small">Date of Birth</div>
                                <div className="fw-semibold">{selected.userId?.dob ? formatDateTime(selected.userId.dob) : '-'}</div>
                              </div>
                            </div>

                            <div className="mt-4">
                              <h6 className="fw-bold mb-2">User KYC Details</h6>
                              <div className="d-flex flex-column gap-2">
                                <div>
                                  <div className="text-muted-sp small">PAN Number</div>
                                  <div className="fw-semibold">{selected.panNumber || '-'}</div>
                                </div>
                                <div>
                                  <div className="text-muted-sp small">Aadhaar Number</div>
                                  <div className="fw-semibold">{selected.aadhaarNumber ? `XXXX XXXX ${String(selected.aadhaarNumber).slice(-4)}` : '-'}</div>
                                </div>
                              </div>
                            </div>

                          </GlassCard>
                        </div>

                        <div className="col-lg-6">
                          <GlassCard className="p-3">
                            <h6 className="fw-bold mb-3">Admin Decision</h6>

                            <div className="d-flex flex-wrap gap-2">
                              <button type="button" className="btn btn-sp-primary" onClick={reviewApprove}>
                                Approve KYC
                              </button>
                              <button type="button" className="btn btn-sp-danger" onClick={openReject}>
                                Reject KYC
                              </button>
                            </div>

                            {rejectOpen && (
                              <div className="mt-4">
                                <div className="mb-3">
                                  <div className="text-muted-sp small mb-1">Reject Reason</div>
                                  <select
                                    className="form-select form-select-sm"
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                  >
                                    <option value="">Select reason</option>
                                    {REJECTION_REASONS.map((r) => (
                                      <option key={r} value={r}>
                                        {r}
                                      </option>
                                    ))}
                                  </select>
                                </div>

                                <div className="mb-3">
                                  <div className="text-muted-sp small mb-1">Admin Remarks</div>
                                  <textarea
                                    className="form-control form-control-sm"
                                    rows={4}
                                    value={rejectRemarks}
                                    onChange={(e) => setRejectRemarks(e.target.value)}
                                  />
                                </div>

                                {reviewError && <div className="alert alert-danger py-2 small">{reviewError}</div>}

                                <div className="d-flex flex-wrap gap-2">
                                  <button type="button" className="btn btn-sp-danger" onClick={submitReject}>
                                    Confirm Reject
                                  </button>
                                  <button type="button" className="btn btn-sp-outline" onClick={closeReject}>
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            )}
                          </GlassCard>
                        </div>

                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'PENDING' && (
              <>
                <GlassCard className="p-4 mb-4">
                  <h6 className="fw-bold mb-3">Pending KYC</h6>

                  {visibleItems.length === 0 ? (
                    <EmptyState
                      icon="bi-file-earmark-check"
                      title="No pending KYC"
                      message="There are no pending KYC submissions right now."
                    />
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-dark-sp mb-0 align-middle">
                        <thead>
                          <tr>
                            <th>User Name</th>
                            <th>Email</th>
                            <th>Phone Number</th>
                            <th>Submitted Date</th>
                            <th>Status</th>
                            <th>Review Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {visibleItems.map((item) => (
                            <tr key={item._id}>
                              <td>{getUserName(item.userId)}</td>
                              <td className="text-muted-sp small">{item.userId?.email || '-'}</td>
                              <td className="text-muted-sp small">{formatPhone(item.userId?.phone)}</td>
                              <td className="text-muted-sp small">{formatDateTime(item.createdAt)}</td>
                              <td>
                                <StatusBadge status={item.status} />
                              </td>
                              <td className="text-end">
                                <button type="button" className="btn btn-sm btn-sp-primary" onClick={() => openReview(item._id)}>
                                  Review
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </GlassCard>


              </>
            )}

            {activeTab === 'APPROVED' && (
              <GlassCard className="p-4">
                <h6 className="fw-bold mb-3">Approved KYC</h6>
                {visibleItems.length === 0 ? (
                  <EmptyState icon="bi-check2-circle" title="No approved KYC" message="No approved KYC submissions found." />
                ) : (
                  <div className="table-responsive">
                    <table className="table table-dark-sp mb-0 align-middle">
                      <thead>
                        <tr>
                          <th>User Name</th>
                          <th>Approved By</th>
                          <th>Approval Date & Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {visibleItems.map((item) => (
                          <tr key={item._id}>
                            <td>{getUserName(item.userId)}</td>
                            <td className="text-muted-sp small">{item.reviewedBy?.name || item.reviewedBy?.email || '-'}</td>
                            <td className="text-muted-sp small">{formatDateTime(item.reviewedAt || item.updatedAt || item.createdAt)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </GlassCard>
            )}

            {activeTab === 'REJECTED' && (
              <GlassCard className="p-4">
                <h6 className="fw-bold mb-3">Rejected KYC</h6>
                {visibleItems.length === 0 ? (
                  <EmptyState icon="bi-x-circle" title="No rejected KYC" message="No rejected KYC submissions found." />
                ) : (
                  <div className="table-responsive">
                    <table className="table table-dark-sp mb-0 align-middle">
                      <thead>
                        <tr>
                          <th>User Name</th>
                          <th>Rejected By</th>
                          <th>Rejection Date & Time</th>
                          <th>Rejection Reason</th>
                        </tr>
                      </thead>
                      <tbody>
                        {visibleItems.map((item) => (
                          <tr key={item._id}>
                            <td>{getUserName(item.userId)}</td>
                            <td className="text-muted-sp small">{item.reviewedBy?.name || item.reviewedBy?.email || '-'}</td>
                            <td className="text-muted-sp small">{formatDateTime(item.reviewedAt || item.updatedAt || item.createdAt)}</td>
                            <td className="text-muted-sp small">{item.reason || item.rejectionReason || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </GlassCard>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

