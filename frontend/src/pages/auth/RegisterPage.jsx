import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../../store/authSlice';
import FormInput from '../../components/common/FormInput';
import {
  validateName,
  validateEmail,
  validatePhone,
  validatePassword,
  validateConfirmPassword,
  getFormErrors,
  isValidForm,
} from '../../utils/validators';

export default function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, status, error } = useSelector((s) => s.auth);

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    dateOfBirth: '',
  });
  const [errors, setErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard');
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: '' }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = getFormErrors(form, {
      firstName: (v) => validateName(v, 'First name'),
      lastName: (v) => validateName(v, 'Last name'),
      email: validateEmail,
      phone: validatePhone,
      password: validatePassword,
      confirmPassword: (v) => validateConfirmPassword(form.password, v),
      dateOfBirth: (v) => (!v ? 'Date of birth is required' : ''),
    });
    setErrors(validationErrors);
    if (isValidForm(validationErrors)) {
      dispatch(registerUser(form)).then((res) => {
        if (res.meta.requestStatus === 'fulfilled') {
          setSuccessMsg('Registration successful! Please check your email to verify your account.');
          navigate(`/otp-verify?email=${encodeURIComponent(form.email)}`);
        }
      });
    }
  };

  const loading = status === 'loading';

  return (
    <div className="glass-card p-4 p-lg-5">
      <div className="text-center mb-4">
        <i className="bi bi-person-plus fs-1" style={{ color: 'var(--sp-primary)' }} />
        <h3 className="fw-bold mt-2">Create Account</h3>
        <p className="text-muted-sp small">Join SecurePay NeoBank today</p>
      </div>

      {error && (
        <div className="alert alert-danger py-2 small" role="alert">
          <i className="bi bi-exclamation-circle me-2" />
          {error}
        </div>
      )}
      {successMsg && (
        <div className="alert alert-success py-2 small" role="alert">
          <i className="bi bi-check-circle me-2" />
          {successMsg}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-6">
            <FormInput label="First Name" name="firstName" value={form.firstName} onChange={handleChange} error={errors.firstName} placeholder="John" required />
          </div>
          <div className="col-6">
            <FormInput label="Last Name" name="lastName" value={form.lastName} onChange={handleChange} error={errors.lastName} placeholder="Doe" required />
          </div>
        </div>
        <FormInput label="Email" name="email" type="email" value={form.email} onChange={handleChange} error={errors.email} placeholder="you@example.com" required />
        <FormInput label="Phone" name="phone" type="tel" value={form.phone} onChange={handleChange} error={errors.phone} placeholder="9876543210" required />
        <FormInput label="Date of Birth" name="dateOfBirth" type="date" value={form.dateOfBirth} onChange={handleChange} error={errors.dateOfBirth} required />
        <FormInput label="Password" name="password" type="password" value={form.password} onChange={handleChange} error={errors.password} placeholder="Min 8 chars, uppercase, number, special" required />
        <FormInput label="Confirm Password" name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} error={errors.confirmPassword} placeholder="Re-enter password" required />

        <button type="submit" className="btn btn-sp-primary w-100 py-2 mb-3" disabled={loading}>
          {loading ? (
            <span className="spinner-border spinner-border-sm me-2" role="status" />
          ) : null}
          {loading ? 'Creating account...' : 'Create Account'}
        </button>
      </form>

      <p className="text-center text-muted-sp small mb-0">
        Already have an account?{' '}
        <Link to="/login" style={{ color: 'var(--sp-primary)' }}>
          Sign in
        </Link>
      </p>
    </div>
  );
}
