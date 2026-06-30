import React from 'react';
import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center p-3">
      <div className="row w-100" style={{ maxWidth: 1100 }}>
        <div className="col-lg-6 d-none d-lg-flex flex-column justify-content-center p-5">
          <div
            className="rounded-4 p-5"
            style={{
              background: 'linear-gradient(135deg, rgba(77, 212, 198, 0.12), rgba(90, 140, 255, 0.10))',
              border: '1px solid var(--sp-border)',
            }}
          >
            <i className="bi bi-wallet2 display-1" style={{ color: 'var(--sp-primary)' }} />
            <h2 className="fw-bold mt-4 mb-2">SecurePay NeoBank</h2>
            <p className="text-muted-sp" style={{ maxWidth: 360 }}>
              Your next-generation digital banking experience. Fast, secure, and intelligent.
            </p>
            <div className="mt-4 d-flex gap-4">
              <div>
                <h4 className="fw-bold mb-0" style={{ color: 'var(--sp-primary)' }}>50K+</h4>
                <small className="text-muted-sp">Active Users</small>
              </div>
              <div>
                <h4 className="fw-bold mb-0" style={{ color: 'var(--sp-primary-2)' }}>₹10Cr+</h4>
                <small className="text-muted-sp">Transactions</small>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-6 d-flex align-items-center justify-content-center">
          <div className="w-100" style={{ maxWidth: 420 }}>
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
