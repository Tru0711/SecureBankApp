import React from 'react';

export default function MetricCard({ label, value, icon, trend, color = 'var(--sp-primary)' }) {
  return (
    <div className="glass-card p-4 h-100 d-flex flex-column justify-content-between">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <span className="text-muted-sp fw-semibold small text-uppercase">{label}</span>
        {icon && <i className={`${icon} fs-4`} style={{ color }} />}
      </div>
      <div>
        <h2 className="fw-bold mb-0" style={{ color }}>{value}</h2>
        {trend && (
          <small className={`mt-2 d-inline-flex align-items-center gap-1 ${trend.isUp ? 'text-success' : 'text-danger'}`}>
            <i className={`bi bi-arrow-${trend.isUp ? 'up' : 'down'}-short`} />
            {trend.value}
          </small>
        )}
      </div>
    </div>
  );
}
