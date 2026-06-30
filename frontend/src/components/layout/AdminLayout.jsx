import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function AdminLayout() {
  return (
    <div
      className="app-shell d-flex"
      style={{
        minHeight: '100vh',
        background:
          'radial-gradient(900px 420px at 10% 0%, rgba(126, 87, 255, 0.18), transparent 60%), radial-gradient(900px 420px at 90% 0%, rgba(255, 54, 102, 0.12), transparent 60%), linear-gradient(180deg, #071026 0%, #070b17 100%)'
      }}
    >
      <Sidebar />
      <main className="flex-grow-1 d-flex flex-column" style={{ minWidth: 0, padding: '1.25rem' }}>
        <header
          className="glass-card px-4 py-3 mb-4 d-flex align-items-center"
          style={{
            borderRadius: '20px',
            position: 'sticky',
            top: 12,
            zIndex: 20,
            background: 'linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03))',
            border: '1px solid rgba(255,255,255,0.10)'
          }}
        >
          <button
            className="btn d-lg-none p-0 text-white me-3"
            data-bs-toggle="offcanvas"
            data-bs-target="#adminSidebar"
            aria-label="Open admin sidebar"
          >
            <i className="bi bi-list fs-3" />
          </button>

          <div className="d-flex flex-column">
            <h5 className="fw-bold mb-0" style={{ letterSpacing: 0.2 }}>
              SecurePay Operations
            </h5>
            <small className="text-muted-sp">Compliance, fraud, security, and transaction control</small>
          </div>
        </header>

        <Outlet />
      </main>
    </div>
  );
}
