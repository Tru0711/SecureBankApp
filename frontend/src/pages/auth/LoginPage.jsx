import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { clearAuth, loginUser } from '../../store/authSlice';
import FormInput from '../../components/common/FormInput';
import { USER_ROLES } from '../../utils/constants';
import {
  validateEmail,
  validatePassword,
  getFormErrors,
  isValidForm,
} from '../../utils/validators';

export default function LoginPage({ adminMode = false }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, status, error, user } = useSelector((s) => s.auth);

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});

  const getLandingPath = useCallback((authUser) => {
    const defaultPath = authUser?.role === USER_ROLES.ADMIN ? '/admin' : '/dashboard';
    const requestedPath = location.state?.from?.pathname;

    if (!requestedPath) return defaultPath;
    if (authUser?.role === USER_ROLES.ADMIN && requestedPath.startsWith('/admin')) return requestedPath;
    if (authUser?.role !== USER_ROLES.ADMIN && !requestedPath.startsWith('/admin')) return requestedPath;

    return defaultPath;
  }, [location.state]);

  useEffect(() => {
    if (isAuthenticated) navigate(getLandingPath(user), { replace: true });
  }, [getLandingPath, isAuthenticated, navigate, user]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = getFormErrors(form, {
      email: validateEmail,
      password: validatePassword,
    });
    setErrors(validationErrors);
    if (isValidForm(validationErrors)) {
      const res = await dispatch(loginUser(form));
      if (res.meta.requestStatus === 'fulfilled') {
        const loggedInUser = res.payload.data.user;
        if (adminMode && loggedInUser.role !== USER_ROLES.ADMIN) {
          dispatch(clearAuth());
          setErrors((prev) => ({
            ...prev,
            password: 'Admin access requires an administrator account.'
          }));
          return;
        }

        navigate(getLandingPath(loggedInUser), { replace: true });
      } else {
        if (String(res.payload || '').toLowerCase().includes('verify')) {
          navigate(`/otp-verify?email=${encodeURIComponent(form.email)}`);
        }
      }
    }
  };

  const loading = status === 'loading';

  return (
    <div className="glass-card p-4 p-lg-5">
      <div className="text-center mb-4">
        <i className="bi bi-wallet2 fs-1" style={{ color: 'var(--sp-primary)' }} />
        <h3 className="fw-bold mt-2">{adminMode ? 'Admin Sign In' : 'Welcome Back'}</h3>
        <p className="text-muted-sp small">
          {adminMode ? 'Sign in with your administrator account' : 'Sign in to your SecurePay account'}
        </p>
      </div>

      {error && (
        <div className="alert alert-danger py-2 small" role="alert">
          <i className="bi bi-exclamation-circle me-2" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <FormInput
          label="Email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          error={errors.email}
          placeholder="you@example.com"
          required
        />
        <FormInput
          label="Password"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          error={errors.password}
          placeholder="••••••••"
          required
        />

        <div className="d-flex justify-content-end mb-3">
          <Link to="/forgot-password" className="small" style={{ color: 'var(--sp-primary)' }}>
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          className="btn btn-sp-primary w-100 py-2 mb-3"
          disabled={loading}
        >
          {loading ? (
            <span className="spinner-border spinner-border-sm me-2" role="status" />
          ) : null}
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <p className="text-center text-muted-sp small mb-0">
        {adminMode ? (
          <Link to="/login" style={{ color: 'var(--sp-primary)' }}>
            Customer login
          </Link>
        ) : (
          <>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--sp-primary)' }}>
              Create one
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
