import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import PageHeader from '../../components/common/PageHeader';
import GlassCard from '../../components/common/GlassCard';
import FormInput from '../../components/common/FormInput';
import { securityApi } from '../../services/securityApi';
import { updateUser } from '../../store/authSlice';

export default function ForgotPinPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [step, setStep] = useState(1); // 1: Send OTP, 2: Reset PIN
  const [otp, setOtp] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const validateStrength = (pin) => {
    if (!/^\d{4,6}$/.test(pin)) return 'PIN must be between 4 and 6 digits';
    if ('1234567890'.includes(pin) || '0123456789'.includes(pin) || '9876543210'.includes(pin)) {
      return 'Sequential PINs are too weak';
    }
    if (/^(\d)\1+$/.test(pin)) {
      return 'Repeating digit PINs are too weak';
    }
    return null;
  };

  const handleSendOtp = async () => {
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await securityApi.forgotPin();
      setMessage(res.message || 'OTP sent successfully to your registered email.');
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPin = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!otp) {
      setError('OTP is required');
      return;
    }

    const strengthErr = validateStrength(newPin);
    if (strengthErr) {
      setError(strengthErr);
      return;
    }

    if (newPin !== confirmPin) {
      setError('PINs do not match');
      return;
    }

    setLoading(true);
    try {
      await securityApi.resetPin({ otp, newPin, confirmPin });
      dispatch(updateUser({ hasTransactionPin: true }));
      setMessage('Transaction PIN reset successfully!');
      setTimeout(() => {
        navigate('/profile/security');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset PIN. Please check details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader title="Reset Transaction PIN" subtitle="Forgot your PIN? Reset it securely using an OTP." />

      <div className="row justify-content-center">
        <div className="col-lg-6">
          <GlassCard className="p-4">
            {message && <div className="alert alert-success py-2 small mb-3">{message}</div>}
            {error && <div className="alert alert-danger py-2 small mb-3">{error}</div>}

            {step === 1 ? (
              <div className="text-center py-4">
                <i className="bi bi-shield-lock display-4 text-muted-sp mb-3 d-block" />
                <h5 className="fw-bold mb-3">Reset via Registered Email</h5>
                <p className="text-muted-sp small mb-4">
                  We will send a 6-digit one-time passcode (OTP) to your registered email address to verify your identity.
                </p>
                <button
                  className="btn btn-sp-primary px-5 py-2 w-100"
                  onClick={handleSendOtp}
                  disabled={loading}
                >
                  {loading ? 'Sending...' : 'Send OTP'}
                </button>
                <button
                  className="btn btn-link btn-sm text-decoration-none text-muted-sp mt-3"
                  onClick={() => navigate('/profile/security')}
                >
                  Back to Security Settings
                </button>
              </div>
            ) : (
              <form onSubmit={handleResetPin}>
                <div className="mb-3">
                  <FormInput
                    label="Enter 6-Digit OTP"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    required
                  />
                </div>

                <div className="mb-3">
                  <FormInput
                    label="Configure New PIN"
                    type="password"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="4 to 6 digit PIN"
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                    required
                  />
                  <small className="text-muted-sp d-block mt-1">
                    Choose a secure PIN. Avoid simple sequential patterns (e.g. 1234) or repeating numbers (e.g. 1111).
                  </small>
                </div>

                <div className="mb-4">
                  <FormInput
                    label="Confirm New PIN"
                    type="password"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="Confirm PIN"
                    value={confirmPin}
                    onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                    required
                  />
                </div>

                <div className="d-flex align-items-center justify-content-between gap-3 mt-4">
                  <button
                    type="button"
                    className="btn btn-sp-outline px-4"
                    onClick={() => setStep(1)}
                    disabled={loading}
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="btn btn-sp-primary px-4"
                    disabled={loading}
                  >
                    {loading ? 'Resetting...' : 'Reset PIN'}
                  </button>
                </div>
              </form>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
