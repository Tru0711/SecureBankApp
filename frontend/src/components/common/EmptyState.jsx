import React from 'react';

export default function EmptyState({ icon = 'bi-inbox', title = 'No data', message = '', action }) {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center py-5 text-muted-sp">
      <i className={`${icon} display-3 mb-3`} style={{ color: 'var(--sp-text-muted)' }} />
      <h5 className="fw-bold mb-2">{title}</h5>
      {message && <p className="mb-3 text-center" style={{ maxWidth: 360 }}>{message}</p>}
      {action && (
        <button className="btn btn-sp-primary px-4 py-2" onClick={action.onClick}>
          {action.label}
        </button>
      )}
    </div>
  );
}
