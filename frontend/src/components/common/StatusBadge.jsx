import React from 'react';
import { STATUS_COLORS } from '../../utils/constants';

export default function StatusBadge({ status = '' }) {
  const color = STATUS_COLORS[status] || 'secondary';
  return (
    <span className={`status-pill badge-soft-${color}`}>
      {status}
    </span>
  );
}
