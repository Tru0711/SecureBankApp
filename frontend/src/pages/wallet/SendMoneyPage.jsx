import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { transferMoney } from '../../store/walletSlice';
import PageHeader from '../../components/common/PageHeader';
import GlassCard from '../../components/common/GlassCard';
import AmountDisplay from '../../components/common/AmountDisplay';
import { validateEmail, validateAmount, getFormErrors, isValidForm } from '../../utils/validators';

export default function SendMoneyPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { balance } = useSelector((s) => s.wallet);

  const [form, setForm] = useState({ receiverEmail: searchParams.get('recipient') || '', amount: '', description: '', transactionPin: '' });
  const [errors, setErrors] = useState({});
  const [transferError, setTransferError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: '' }));
    setTransferError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = getFormErrors(form, {
      receiverEmail: validateEmail,
      amount: (v) => validateAmount(v, 1, balance?.availableBalance || 0),
    });
    setErrors(validationErrors);
    if (isValidForm(validationErrors)) {
      setLoading(true);
      const payload = {
        receiverEmail: form.receiverEmail,
        amount: Number(form.amount),
        description: form.description || 'Payment transfer',
        transactionPin: form.transactionPin,
        deviceFingerprint: 'web_' + Date.now(),
      };
      const res = await dispatch(transferMoney(payload));
      setLoading(false);
      if (res.meta.requestStatus === 'fulfilled') {
        setSuccess(res.payload.data.transaction);
      } else {
        setTransferError(res.payload || 'Unable to send money');
      }
    }
  };

  if (success) {
    return (
      <div>
        <PageHeader title="Send Money" subtitle="Payment sent successfully" />
        <GlassCard className="text-center py-5">
          <i className="bi bi-check-circle-fill display-3 mb-3" style={{ color: 'var(--sp-success)' }} />
          <h3 className="fw-bold mb-2">Payment Sent!</h3>
          <p className="text-muted-sp mb-1">
            <AmountDisplay amount={success.amount} /> sent to {success.receiver?.firstName || form.receiverEmail}
          </p>
          <small className="text-muted-sp">Transaction ID: {success.transactionId}</small>
          <div className="d-flex gap-3 justify-content-center mt-4">
            <button className="btn btn-sp-primary px-4" onClick={() => navigate('/transactions')}>
              View Transactions
            </button>
            <button className="btn btn-sp-outline px-4" onClick={() => { setSuccess(null); setForm({ receiverEmail: '', amount: '', description: '', transactionPin: '' }); }}>
              Send Again
            </button>
          </div>
        </GlassCard>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Send Money" subtitle="Transfer money to another SecurePay user" />

      <div className="row g-4">
        <div className="col-lg-7">
          <GlassCard>
            {transferError && <div className="alert alert-danger py-2 small">{transferError}</div>}
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label fw-semibold text-muted-sp">Recipient Email</label>
                <input
                  name="receiverEmail"
                  type="email"
                  className={`form-control${errors.receiverEmail ? ' is-invalid' : ''}`}
                  value={form.receiverEmail}
                  onChange={handleChange}
                  placeholder="recipient@example.com"
                />
                {errors.receiverEmail && <div className="invalid-feedback d-block">{errors.receiverEmail}</div>}
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold text-muted-sp">Amount</label>
                <div className="input-group">
                  <span className="input-group-text" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--sp-border)', color: 'var(--sp-text)' }}>₹</span>
                  <input
                    name="amount"
                    type="number"
                    className={`form-control${errors.amount ? ' is-invalid' : ''}`}
                    value={form.amount}
                    onChange={handleChange}
                    placeholder="0"
                    min="1"
                  />
                </div>
                {errors.amount && <div className="invalid-feedback d-block">{errors.amount}</div>}
              </div>

              <div className="mb-4">
                <label className="form-label fw-semibold text-muted-sp">Description (optional)</label>
                <input
                  name="description"
                  type="text"
                  className="form-control"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="What's this for?"
                />
              </div>

              <div className="mb-4">
                <label className="form-label fw-semibold text-muted-sp">Transaction PIN</label>
                <input
                  name="transactionPin"
                  type="password"
                  inputMode="numeric"
                  maxLength={6}
                  className="form-control"
                  value={form.transactionPin}
                  onChange={handleChange}
                  placeholder="4 to 6 digit PIN"
                />
              </div>

              <button type="submit" className="btn btn-sp-primary w-100 py-2" disabled={loading || form.transactionPin.length < 4}>
                {loading ? (
                  <span className="spinner-border spinner-border-sm me-2" role="status" />
                ) : null}
                {loading ? 'Processing...' : `Send ₹${Number(form.amount || 0).toLocaleString('en-IN')}`}
              </button>
            </form>
          </GlassCard>
        </div>

        <div className="col-lg-5">
          <GlassCard>
            <h5 className="fw-bold mb-3">Your Balance</h5>
            <h2 className="fw-bold" style={{ color: 'var(--sp-primary)' }}>
              <AmountDisplay amount={balance?.availableBalance || balance?.balance || 0} />
            </h2>
            <hr style={{ borderColor: 'var(--sp-border)' }} />
            <div className="d-flex align-items-start gap-2 text-muted-sp small">
              <i className="bi bi-shield-check mt-1" />
              <span>All transfers are secured with end-to-end encryption and monitored for fraud.</span>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
