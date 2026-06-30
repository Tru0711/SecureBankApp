import React, { useMemo, useState } from 'react';

// Minimal modal/dialog for rejection reason selection.
// Uses Bootstrap modal markup to avoid adding new dependencies.
// Parent controls visibility via `open`.
export default function ReasonSelectModal({
  open,
  reasons,
  onCancel,
  onConfirm,
  title = 'Rejection Reason',
  requireOther = true,
  defaultReason = null
}) {
  const [reason, setReason] = useState(defaultReason || '');
  const [otherText, setOtherText] = useState('');

  const showOther = useMemo(() => reason === 'Other', [reason]);

  // Reset local state when modal opens.
  React.useEffect(() => {
    if (!open) return;
    setReason(defaultReason || '');
    setOtherText('');
  }, [open, defaultReason]);

  if (!open) return null;

  const canConfirm = showOther ? otherText.trim().length > 0 : Boolean(reason);

  const handleConfirm = () => {
    if (!canConfirm) return;
    const finalReason = showOther ? `Other: ${otherText.trim()}` : reason;
    onConfirm?.(finalReason);
  };

  return (
    <div
      className="modal fade show"
      style={{ display: 'block' }}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
    >
      <div className="modal-dialog modal-dialog-centered" role="document">
        <div className="modal-content" style={{ background: 'rgba(10, 18, 40, 0.98)', border: '1px solid var(--sp-border)' }}>
          <div className="modal-header" style={{ borderColor: 'var(--sp-border)' }}>
            <h5 className="modal-title">{title}</h5>
            <button type="button" className="btn-close btn-close-white" aria-label="Close" onClick={onCancel} />
          </div>

          <div className="modal-body">
            <div className="mb-2 text-muted-sp small">Select one reason for rejection.</div>
            <div className="d-flex flex-column gap-2">
              {reasons.map((r) => (
                <label key={r} className="d-flex align-items-center gap-2" style={{ cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="kycRejectReason"
                    value={r}
                    checked={reason === r}
                    onChange={() => setReason(r)}
                  />
                  <span>{r}</span>
                </label>
              ))}
            </div>

            {requireOther && showOther && (
              <div className="mt-3">
                <div className="text-muted-sp small mb-2">Enter details for Other</div>
                <textarea
                  className="form-control"
                  rows={3}
                  value={otherText}
                  onChange={(e) => setOtherText(e.target.value)}
                  placeholder="Provide rejection details..."
                />
              </div>
            )}
          </div>

          <div className="modal-footer" style={{ borderColor: 'var(--sp-border)' }}>
            <button type="button" className="btn btn-sp-outline" onClick={onCancel}>
              Cancel
            </button>
            <button type="button" className="btn btn-sp-danger" onClick={handleConfirm} disabled={!canConfirm}>
              Confirm Reject
            </button>
          </div>
        </div>
      </div>

      {/* Backdrop */}
      <div className="modal-backdrop fade show" />
    </div>
  );
}

