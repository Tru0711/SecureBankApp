import React from 'react';

export default function ConfirmModal({
  show = false,
  open,
  title = 'Confirm',
  message = 'Are you sure?',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirmVariant = 'danger',
  onConfirm,
  onClose,
  onCancel,
  disableConfirm = false,
  children,
}) {
  const isOpen = typeof open === 'boolean' ? open : show;
  const close = onClose || onCancel;

  if (!isOpen) return null;

  return (
    <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content" style={{ background: 'var(--sp-bg-soft)', color: 'var(--sp-text)', border: '1px solid var(--sp-border)' }}>
          <div className="modal-header border-0">
            <h5 className="modal-title fw-bold">{title}</h5>
            <button type="button" className="btn-close btn-close-white" onClick={close} />
          </div>
          <div className="modal-body">
            {children || <p className="mb-0 text-muted-sp">{message}</p>}
          </div>
          <div className="modal-footer border-0">
            <button className="btn btn-sp-outline px-4" onClick={close}>{cancelLabel}</button>
            <button className={`btn btn-${confirmVariant} px-4`} onClick={onConfirm} disabled={disableConfirm}>
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
