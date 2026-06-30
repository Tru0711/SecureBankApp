import React, { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { resendOtp, verifyOtp } from '../../store/authSlice';

export default function OtpVerificationPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { error } = useSelector((s) => s.auth);

  const email = searchParams.get('email') || '';
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [success, setSuccess] = useState('');
  const inputRefs = useRef([]);

  const handleOtpChange = (index, value) => {
    if (value && !/^\d$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) return;
    if (!email) return;
    setLoading(true);
    const res = await dispatch(verifyOtp({ email, otp: otpString, type: 'EMAIL_VERIFICATION' }));
    setLoading(false);
    if (res.meta.requestStatus === 'fulfilled') {
      setSuccess('Email verified successfully!');
      setTimeout(() => navigate('/login', { replace: true }), 1200);
    }
  };

  const handleResend = async () => {
    if (!email) return;
    setResending(true);
    const res = await dispatch(resendOtp({ email, type: 'EMAIL_VERIFICATION' }));
    if (res.meta.requestStatus === 'fulfilled') {
      setSuccess('A new OTP has been sent.');
    }
    setResending(false);
  };

  return (
    <div className="glass-card p-4 p-lg-5">
      <div className="text-center mb-4">
        <i className="bi bi-shield-check fs-1" style={{ color: 'var(--sp-primary)' }} />
        <h3 className="fw-bold mt-2">Verify Email</h3>
        <p className="text-muted-sp small">
          Enter the 6-digit code sent to {email || 'your email'}
        </p>
      </div>

      {error && (
        <div className="alert alert-danger py-2 small" role="alert">
          <i className="bi bi-exclamation-circle me-2" />
          {error}
          {String(error).toLowerCase().includes('expired') ? ' Request a new code and try again.' : ''}
        </div>
      )}
      {!email && (
        <div className="alert alert-warning py-2 small" role="alert">
          Email is required to verify OTP. Please register again or open the verification link from registration.
        </div>
      )}
      {success && (
        <div className="alert alert-success py-2 small" role="alert">
          <i className="bi bi-check-circle me-2" />
          {success}
        </div>
      )}

      <div className="d-flex justify-content-center gap-2 mb-4">
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            maxLength={1}
            value={digit}
            onChange={(e) => handleOtpChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            className="form-control text-center fw-bold"
            style={{
              width: 52,
              height: 60,
              fontSize: '1.5rem',
              borderRadius: 12,
            }}
          />
        ))}
      </div>

      <button
        className="btn btn-sp-primary w-100 py-2 mb-3"
        disabled={loading || !email || otp.join('').length !== 6}
        onClick={handleVerify}
      >
        {loading ? (
          <span className="spinner-border spinner-border-sm me-2" role="status" />
        ) : null}
        {loading ? 'Verifying...' : 'Verify Email'}
      </button>

      <div className="text-center">
        <button
          className="btn btn-link text-muted-sp small p-0"
          onClick={handleResend}
          disabled={resending}
        >
          {resending ? 'Resending...' : "Didn't receive the code? Resend"}
        </button>
      </div>
    </div>
  );
}
