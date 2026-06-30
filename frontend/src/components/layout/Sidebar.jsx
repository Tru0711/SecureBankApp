import React, { useMemo, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { closeSidebar } from '../../store/uiSlice';
import { SIDEBAR_LINKS } from '../../utils/constants';

export default function Sidebar() {
  const dispatch = useDispatch();
  const location = useLocation();
  const { user } = useSelector((s) => s.auth);
  const { sidebarOpen } = useSelector((s) => s.ui);

  const role = user?.role === 'ADMIN' ? 'admin' : 'user';
  const links = useMemo(() => SIDEBAR_LINKS[role] || [], [role]);

  const isAdmin = role === 'admin';
  const [collapsed, setCollapsed] = useState(false);

  const handleClose = () => dispatch(closeSidebar());

  const content = (
    <div className="d-flex flex-column h-100">
      <div className="d-flex align-items-center justify-content-between mb-4 px-2">
        <div className="d-flex align-items-center gap-2">
          <i className="bi bi-wallet2 fs-4" style={{ color: 'var(--sp-primary)' }} />
          <span className="h5 fw-bold mb-0">SecurePay</span>
        </div>
        <button className="btn d-lg-none p-0 text-white" onClick={handleClose}>
          <i className="bi bi-x-lg fs-5" />
        </button>
      </div>

      <div className="d-flex align-items-center justify-content-between px-2 mt-1 mb-3">
        <span className="text-muted-sp small" style={{ letterSpacing: 0.2 }}>
          {isAdmin ? 'SECURITY OPERATIONS' : 'NAVIGATION'}
        </span>
        <button
          type="button"
          className="btn p-1"
          style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--sp-text)', border: '1px solid var(--sp-border)' }}
          onClick={() => setCollapsed((v) => !v)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <i className={`bi ${collapsed ? 'bi-chevron-double-right' : 'bi-chevron-double-left'}`} />
        </button>
      </div>

      <nav className="sidebar-nav flex-grow-1">
        {links.map((link) => (

          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) =>
              `nav-link d-flex align-items-center gap-3 ${isActive ? 'active' : ''}`
            }
            onClick={handleClose}
            style={collapsed ? { justifyContent: 'center' } : undefined}
          >
            <i className={`${link.icon} fs-5`} />
            {!collapsed && <span>{link.label}</span>}
          </NavLink>
        ))}
      </nav>


      <div className="px-2 pt-3 border-top" style={{ borderColor: 'var(--sp-border)' }}>
        <div className="d-flex align-items-center gap-2 text-muted-sp small">
          <i className="bi bi-shield-check" />
          <span>Secured by SecurePay</span>
        </div>

        {/* Logout for users who don’t see header dropdown */}
        <button
          className="btn btn-sp-outline w-100 mt-3"
          onClick={() => {
            // Logout is handled via header dropdown; keep fallback navigation here.
            localStorage.removeItem('securepay_auth');
            window.location.href = '/login';
          }}
        >
          <i className="bi bi-box-arrow-right me-2" /> Logout
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="sidebar d-none d-lg-flex flex-column" style={{ width: 260, minWidth: 260 }}>
        <div className="glass-card h-100 p-3">{content}</div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="d-lg-none position-fixed top-0 start-0 w-100 h-100 z-3" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <div className="h-100 p-3" style={{ width: 280 }}>
            <div className="glass-card h-100 p-3">{content}</div>
          </div>
        </div>
      )}
    </>
  );
}
