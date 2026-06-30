import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { addMoney } from '../../store/walletSlice';
import PageHeader from '../../components/common/PageHeader';
import GlassCard from '../../components/common/GlassCard';
import FormInput from '../../components/common/FormInput';
import AmountDisplay from '../../components/common/AmountDisplay';
import ConfirmModal from '../../components/common/ConfirmModal';
import { userApi } from '../../services/userApi';
import { validateAmount, getFormErrors, isValidForm } from '../../utils/validators';

const PRESET_AMOUNTS = [500, 1000, 2000, 5000, 10000];

export default function AddMoneyPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { balance } = useSelector((s) => s.wallet);

  // Form states
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Bank accounts states
  const [banks, setBanks] = useState([]);
  const [selectedBank, setSelectedBank] = useState('');
  const [banksLoading, setBanksLoading] = useState(false);
  const [banksError, setBanksError] = useState('');

  // PIN modal states
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [pinLoading, setPinLoading] = useState(false);

  useEffect(() => {
    const fetchBanks = async () => {
      setBanksLoading(true);
      setBanksError('');
      try {
        const res = await userApi.listBankAccounts();
        const items = res?.data?.items || res?.items || [];
        setBanks(items);
        const primary = items.find((x) => x.isPrimary) || items[0];
        if (primary) {
          setSelectedBank(primary._id || primary.id);
        }
      } catch (err) {
        setBanksError(err?.response?.data?.message || 'Unable to load bank accounts');
      } finally {
        setBanksLoading(false);
      }
    };
    fetchBanks();
  }, []);

  const handlePreset = (val) => {
    setAmount(String(val));
    setError('');
  };

  const handleAddMoneyClick = (e) => {
    e.preventDefault();
    setError('');

    const errors = getFormErrors({ amount }, { amount: validateAmount });
    setError(errors.amount || '');

    if (!selectedBank) {
      setError('Please select a bank account');
      return;
    }

    if (isValidForm(errors)) {
      setPin('');
      setPinError('');
      setPinModalOpen(true);
    }
  };

  const handleConfirmPin = async () => {
    setPinError('');
    if (!/^\d{4,6}$/.test(pin)) {
      setPinError('Transaction PIN must be 4 to 6 digits');
      return;
    }

    setPinLoading(true);
    try {
      const res = await dispatch(addMoney({
        amount: Number(amount),
        paymentMethodId: 'pm_razorpay',
        razorpayPaymentId: 'pay_' + Date.now(),
        bankAccountId: selectedBank,
        transactionPin: pin
      })).unwrap();

      setPinModalOpen(false);
      setSuccess(true);
    } catch (err) {
      setPinError(err || 'Failed to add money. Invalid PIN.');
    } finally {
      setPinLoading(false);
    }
  };

  if (success) {
    return (
      <div>
        <PageHeader title="Add Money" subtitle="Money added successfully" />
        <GlassCard className="text-center py-5">
          <i className="bi bi-check-circle-fill display-3 mb-3" style={{ color: 'var(--sp-success)' }} />
          <h3 className="fw-bold mb-2">₹{Number(amount).toLocaleString('en-IN')} Added!</h3>
          <p className="text-muted-sp mb-4">The money has been added from your bank account to your wallet.</p>
          <div className="d-flex gap-3 justify-content-center">
            <button className="btn btn-sp-primary px-4" onClick={() => navigate('/wallet')}>
              Go to Wallet
            </button>
            <button className="btn btn-sp-outline px-4" onClick={() => { setSuccess(false); setAmount(''); }}>
              Add More
            </button>
          </div>
        </GlassCard>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Add Money" subtitle="Add funds to your SecurePay wallet" />

      <div className="row g-4">
        <div className="col-lg-7">
          <GlassCard>
            <form onSubmit={handleAddMoneyClick}>
              {banksLoading ? (
                <div className="text-center py-3">
                  <div className="spinner-border spinner-border-sm text-primary" role="status" />
                  <span className="ms-2 text-muted-sp small">Loading bank accounts...</span>
                </div>
              ) : banksError ? (
                <div className="alert alert-danger py-2 small">{banksError}</div>
              ) : banks.length === 0 ? (
                <div className="alert alert-warning py-3 text-center">
                  <p className="small mb-3">You must link a bank account before adding money.</p>
                  <button type="button" className="btn btn-sp-primary btn-sm" onClick={() => navigate('/profile')}>
                    Link a Bank Account
                  </button>
                </div>
              ) : (
                <>
                  <div className="mb-4">
                    <label className="form-label fw-semibold text-muted-sp">Select Bank Account</label>
                    <select
                      className="form-select form-select-lg"
                      value={selectedBank}
                      onChange={(e) => setSelectedBank(e.target.value)}
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--sp-border)', color: 'var(--sp-text)' }}
                      required
                    >
                      {banks.map((acc) => (
                        <option key={acc._id || acc.id} value={acc._id || acc.id} style={{ backgroundColor: '#07111c' }}>
                          {acc.bankName} - {acc.maskedAccountNumber || acc.maskedAccount}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-4">
                    <label className="form-label fw-semibold text-muted-sp">Enter Amount</label>
                    <div className="input-group input-group-lg">
                      <span className="input-group-text" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--sp-border)', color: 'var(--sp-text)' }}>
                        ₹
                      </span>
                      <input
                        type="number"
                        className={`form-control form-control-lg${error ? ' is-invalid' : ''}`}
                        value={amount}
                        onChange={(e) => { setAmount(e.target.value); setError(''); }}
                        placeholder="0"
                        min="1"
                        required
                      />
                    </div>
                    {error && <div className="text-danger small mt-1">{error}</div>}
                  </div>

                  <div className="mb-4">
                    <label className="form-label text-muted-sp small fw-semibold">Quick Select</label>
                    <div className="d-flex flex-wrap gap-2">
                      {PRESET_AMOUNTS.map((val) => (
                        <button
                          key={val}
                          type="button"
                          className={`btn ${Number(amount) === val ? 'btn-sp-primary' : 'btn-sp-outline'}`}
                          onClick={() => handlePreset(val)}
                        >
                          ₹{val.toLocaleString('en-IN')}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button type="submit" className="btn btn-sp-primary w-100 py-2" disabled={loading || !amount || !selectedBank}>
                    {loading ? (
                      <span className="spinner-border spinner-border-sm me-2" role="status" />
                    ) : null}
                    {loading ? 'Processing...' : `Add ₹${Number(amount || 0).toLocaleString('en-IN')}`}
                  </button>
                </>
              )}
            </form>
          </GlassCard>
        </div>

        <div className="col-lg-5">
          <GlassCard>
            <h5 className="fw-bold mb-3">Current Balance</h5>
            <h2 className="fw-bold" style={{ color: 'var(--sp-primary)' }}>
              <AmountDisplay amount={balance?.availableBalance || balance?.balance || 0} />
            </h2>
            <hr style={{ borderColor: 'var(--sp-border)' }} />
            <div className="d-flex align-items-center gap-2 text-muted-sp small">
              <i className="bi bi-info-circle" />
              <span>Added money is available instantly in your wallet for transfers and payments.</span>
            </div>
          </GlassCard>
        </div>
      </div>

      <ConfirmModal
        open={pinModalOpen}
        title="Verify Transaction PIN"
        onClose={() => setPinModalOpen(false)}
        confirmLabel={pinLoading ? 'Verifying...' : 'Verify PIN'}
        cancelLabel="Cancel"
        onConfirm={handleConfirmPin}
        disableConfirm={!pin || pinLoading}
      >
        <div>
          <div className="mb-2 text-muted-sp small">Please enter your 4 to 6 digit Transaction PIN to authorize this deposit.</div>
          <input
            className="form-control"
            type="password"
            inputMode="numeric"
            maxLength={6}
            placeholder="Transaction PIN"
            value={pin}
            onChange={(e) => {
              setPin(e.target.value.replace(/\D/g, ''));
              setPinError('');
            }}
          />
          {pinError && <div className="text-danger small mt-2">{pinError}</div>}
        </div>
      </ConfirmModal>
    </div>
  );
}
