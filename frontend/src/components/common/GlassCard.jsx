import React from 'react';

export default function GlassCard({ children, className = '', onClick }) {
  return (
    <div className={`glass-card p-4 ${className}`} onClick={onClick}>
      {children}
    </div>
  );
}
