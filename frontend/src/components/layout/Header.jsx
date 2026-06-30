import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { toggleSidebar } from '../../store/uiSlice';
import { logoutUser } from '../../store/authSlice';
import { SIDEBAR_LINKS } from '../../utils/constants';

export default function Header() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((s) => s.auth);
  const { items } = useSelector((s) => s.notification);

  const unreadCount = items.filter((n) => !n.isRead).length;

  const getPageTitle = () => {
    const role = user?.role === 'ADMIN' ? 'admin' : 'user';
    const links = SIDEBAR_LINKS[role] || [];
    const match = links.find((l) => l.path === location.pathname);
    return match?.label || 'Dashboard';
  };

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/login');
  };

  const initials = user ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}` : 'U';

  return (
    <header
      className="glass-card px-4 py-3 mb-4 d-flex align-items-center justify-content-between"
      style={{ borderRadius: '20px' }}
    >
      <div className="d-flex align-items-center gap-3">
        <button className="btn d-lg-none p-0 text-white" onClick={() => dispatch(toggleSidebar())}>
          <i className="bi bi-list fs-3" />
        </button>
        <div>
          <h5 className="fw-bold mb-0">{getPageTitle()}</h5>
        </div>
      </div>

      <div className="d-flex align-items-center gap-3">
        <button
          className="btn p-1 position-relative text-muted-sp"
          onClick={() => navigate('/notifications')}
        >
          <i className="bi bi-bell fs-5" />
          {unreadCount > 0 && (
            <span
              className="position-absolute top-0 start-100 translate-middle badge rounded-pill"
              style={{ fontSize: '0.6rem', background: 'var(--sp-danger)' }}
            >
              {unreadCount}
            </span>
          )}
        </button>

        <div className="dropdown">
          <button
            className="btn p-0 d-flex align-items-center gap-2 dropdown-toggle"
            data-bs-toggle="dropdown"
            style={{ color: 'var(--sp-text)' }}
          >
            <div
              className="d-flex align-items-center justify-content-center rounded-circle"
              style={{
                width: 36,
                height: 36,
                background: 'linear-gradient(135deg, var(--sp-primary), var(--sp-primary-2))',
                color: '#07111c',
                fontWeight: 700,
                fontSize: '0.85rem',
              }}
            >
              {initials}
            </div>
          </button>
          <ul className="dropdown-menu dropdown-menu-end" style={{ background: 'var(--sp-bg-soft)', border: '1px solid var(--sp-border)' }}>
            <li>
              <button className="dropdown-item" style={{ color: 'var(--sp-text)' }} onClick={() => navigate('/profile')}>
                <i className="bi bi-person me-2" /> Profile
              </button>
            </li>
            <li>
              <button className="dropdown-item" style={{ color: 'var(--sp-text)' }} onClick={() => navigate('/profile/security')}>
                <i className="bi bi-shield-check me-2" /> Security
              </button>
            </li>
            <li><hr className="dropdown-divider" style={{ borderColor: 'var(--sp-border)' }} /></li>
            <li>
              <button className="dropdown-item text-danger" onClick={handleLogout}>
                <i className="bi bi-box-arrow-right me-2" /> Logout
              </button>
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
}
