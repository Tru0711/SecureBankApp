import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { requestPasswordReset } from '../../store/authSlice';
import FormInput from '../../components/common/FormInput';
import { validateEmail, getFormErrors, isValidForm } from '../../utils/validators';

export default function ForgotPasswordPage() {
  const dispatch = useDispatch();
  const { error } = useSelector((s) => s.auth);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = getFormErrors({ email }, { email: validateEmail });
    setEmailError(errors.email || '');
    if (isValidForm(errors)) {
      setLoading(true);
      const res = await dispatch(requestPasswordReset({ email }));
      setLoading(false);
      if (res.meta.requestStatus === 'fulfilled') {
        setSent(true);
      }
    }
  };

  return (
    <div className="glass-card p-4 p-lg-5">
      <div className="text-center mb-4">
        <i className="bi bi-key fs-1" style={{ color: 'var(--sp-warning)' }} />
        <h3 className="fw-bold mt-2">Reset Password</h3>
        <p className="text-muted-sp small">Enter your email to receive a reset link</p>
      </div>

      {error && (
        <div className="alert alert-danger py-2 small" role="alert">
          <i className="bi bi-exclamation-circle me-2" />
          {error}
        </div>
      )}

      {sent ? (
        <div className="text-center">
          <i className="bi bi-check-circle-fill fs-1 mb-3" style={{ color: 'var(--sp-success)' }} />
          <h5 className="fw-bold">Check Your Email</h5>
          <p className="text-muted-sp small">
            We've sent a password reset link to <strong>{email}</strong>
          </p>
          <Link to="/login" className="btn btn-sp-primary px-4 py-2 mt-2">
            Back to Login
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <FormInput
            label="Email Address"
            name="email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setEmailError('');
            }}
            error={emailError}
            placeholder="you@example.com"
            required
          />
          <button type="submit" className="btn btn-sp-primary w-100 py-2 mb-3" disabled={loading}>
            {loading ? (
              <span className="spinner-border spinner-border-sm me-2" role="status" />
            ) : null}
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
      )}

      <p className="text-center text-muted-sp small mb-0">
        Remember your password?{' '}
        <Link to="/login" style={{ color: 'var(--sp-primary)' }}>
          Sign in
        </Link>
      </p>
    </div>
  );
}
