import React from 'react';

export default function LoadingSpinner({ size = '', text = '' }) {
  const dim = size === 'sm' ? 'width:1.5rem;height:1.5rem' : size === 'lg' ? 'width:3.5rem;height:3.5rem' : 'width:2.5rem;height:2.5rem';
  return (
    <div className="d-flex flex-column align-items-center justify-content-center py-5">
      <div
        className="spinner-border"
        style={{ ...parseStyle(dim), color: 'var(--sp-primary)', borderWidth: '0.2em' }}
        role="status"
      />
      {text && <p className="mt-3 text-muted-sp mb-0">{text}</p>}
    </div>
  );
}

function parseStyle(str) {
  const obj = {};
  str.split(';').filter(Boolean).forEach(pair => {
    const [key, val] = pair.split(':');
    obj[key.trim()] = val.trim();
  });
  return obj;
}
