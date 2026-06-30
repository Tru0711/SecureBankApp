import React from 'react';

export default function PageHeader({ title, subtitle, children }) {
  return (
    <div className="glass-card p-4 mb-4">
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
        <div>
          <h3 className="fw-bold mb-1">{title}</h3>
          {subtitle && <p className="text-muted-sp mb-0">{subtitle}</p>}
        </div>
        {children && <div className="d-flex gap-2">{children}</div>}
      </div>
    </div>
  );
}
