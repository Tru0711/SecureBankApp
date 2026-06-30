import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import GlassCard from '../../components/common/GlassCard';
import PageHeader from '../../components/common/PageHeader';
import FormInput from '../../components/common/FormInput';
import EmptyState from '../../components/common/EmptyState';
import ConfirmModal from '../../components/common/ConfirmModal';
import { setCredentials } from '../../store/authSlice';
import { userApi } from '../../services/userApi';
import { validatePinFormat } from '../../utils/validators';

const blankForm = {
  bankName: '',
  accountHolderName: '',
  accountNumber: '',
  confirmAccountNumber: '',
  ifsc: '',
  branch: '',
  accountType: 'SAVINGS',
  isPrimary: false
};

export default function BankDetailsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { accessToken } = useSelector((s) => s.auth);
  const [accounts, setAccounts] = useState([]);
  const [form, setForm] = useState(blankForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [pendingOperation, setPendingOperation] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await userApi.listBankAccounts();
      setAccounts(res.data.items || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load bank accounts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const refreshUser = async () => {
    const profile = await userApi.getProfile();
    dispatch(setCredentials({ user: profile.data.user, accessToken }));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    setError('');
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(blankForm);
  };

  const requestPinFor = (operation) => {
    setPin('');
    setPinError('');
    setPendingOperation(() => operation);
    setPinModalOpen(true);
  };

  const confirmPin = async () => {
    const pinValidation = validatePinFormat(pin);
    if (pinValidation) {
      setPinError(pinValidation);
      return;
    }

    setSaving(true);
    setPinError('');
    try {
      await pendingOperation(pin);
      setPinModalOpen(false);
      setPendingOperation(null);
      await Promise.all([loadData(), refreshUser()]);
      resetForm();
    } catch (err) {
      setPinError(err.response?.data?.message || 'Transaction PIN verification failed');
    } finally {
      setSaving(false);
    }
  };

  const editAccount = (account) => {
    setEditingId(account._id);
    setForm({
      bankName: account.bankName || '',
      accountHolderName: account.accountHolderName || '',
      accountNumber: '',
      confirmAccountNumber: '',
      ifsc: account.ifsc || '',
      branch: account.branch || '',
      accountType: account.accountType || 'SAVINGS',
      isPrimary: Boolean(account.isPrimary)
    });
  };

  const saveAccount = async (e) => {
    e.preventDefault();
    setError('');

    requestPinFor(async (transactionPin) => {
      if (editingId) {
        await userApi.updateBankAccount(editingId, {
          bankName: form.bankName,
          accountHolderName: form.accountHolderName,
          ifsc: form.ifsc,
          branch: form.branch,
          accountType: form.accountType,
          isPrimary: form.isPrimary,
          transactionPin
        });
      } else {
        await userApi.addBankAccount({ ...form, transactionPin });
      }
    });
  };

  const deleteAccount = async (id) => {
    if (!window.confirm('Delete this bank account?')) return;
    requestPinFor(async (transactionPin) => {
      await userApi.deleteBankAccount(id, { transactionPin });
    });
  };

  const setPrimary = async (id) => {
    requestPinFor(async (transactionPin) => {
      await userApi.setPrimaryBankAccount(id, { transactionPin });
    });
  };

  return (
    <div>
      <PageHeader title="Bank Details" subtitle="Add and manage bank accounts for wallet funding and compliance.">
        <button className="btn btn-sp-outline" onClick={() => navigate('/security-center')}>
          Manage Transaction PIN
        </button>
        <button className="btn btn-sp-primary" disabled={accounts.length === 0} onClick={() => navigate('/onboarding/kyc')}>
          Continue to KYC
        </button>
      </PageHeader>

      {error && <div className="alert alert-danger py-2 small">{error}</div>}

      <div className="row g-4">
        <div className="col-lg-5">
          <GlassCard>
            <h5 className="fw-bold mb-3">{editingId ? 'Edit Bank' : 'Add Bank'}</h5>
            <form onSubmit={saveAccount}>
              <FormInput label="Bank Name" name="bankName" value={form.bankName} onChange={handleChange} required />
              <FormInput label="Account Holder Name" name="accountHolderName" value={form.accountHolderName} onChange={handleChange} required />
              {!editingId && (
                <>
                  <FormInput label="Account Number" name="accountNumber" value={form.accountNumber} onChange={handleChange} required />
                  <FormInput label="Confirm Account Number" name="confirmAccountNumber" value={form.confirmAccountNumber} onChange={handleChange} required />
                </>
              )}
              <FormInput label="IFSC" name="ifsc" value={form.ifsc} onChange={handleChange} placeholder="HDFC0001234" required />
              <FormInput label="Branch" name="branch" value={form.branch} onChange={handleChange} />
              <div className="mb-3">
                <label className="form-label fw-semibold text-muted-sp">Account Type</label>
                <select name="accountType" className="form-select" value={form.accountType} onChange={handleChange}>
                  <option value="SAVINGS">Savings</option>
                  <option value="CURRENT">Current</option>
                  <option value="SALARY">Salary</option>
                  <option value="NRE">NRE</option>
                  <option value="NRO">NRO</option>
                </select>
              </div>
              <label className="d-flex align-items-center gap-2 mb-4 text-muted-sp">
                <input type="checkbox" name="isPrimary" checked={form.isPrimary} onChange={handleChange} />
                Set as primary bank
              </label>
              <div className="d-flex gap-2">
                <button type="submit" className="btn btn-sp-primary px-4" disabled={saving}>
                  {saving ? 'Saving...' : editingId ? 'Update Bank' : 'Add Bank'}
                </button>
                {editingId && (
                  <button type="button" className="btn btn-sp-outline" onClick={resetForm}>
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </GlassCard>
        </div>

        <div className="col-lg-7">
          <GlassCard>
            <h5 className="fw-bold mb-3">Saved Banks</h5>
            {loading ? (
              <p className="text-muted-sp mb-0">Loading bank accounts...</p>
            ) : accounts.length === 0 ? (
              <EmptyState icon="bi-bank" title="No bank accounts" message="Add a bank account to continue onboarding." />
            ) : (
              <div className="d-flex flex-column gap-3">
                {accounts.map((account) => (
                  <div key={account._id} className="soft-card p-3">
                    <div className="d-flex flex-wrap align-items-start justify-content-between gap-3">
                      <div>
                        <div className="d-flex align-items-center gap-2">
                          <h6 className="fw-bold mb-0">{account.bankName}</h6>
                          {account.isPrimary && <span className="status-pill badge-soft-success">PRIMARY</span>}
                        </div>
                        <p className="text-muted-sp small mb-1">{account.accountHolderName}</p>
                        <p className="mb-0">{account.maskedAccountNumber} · {account.ifsc}</p>
                      </div>
                      <div className="d-flex flex-wrap gap-2">
                        {!account.isPrimary && (
                          <button className="btn btn-sm btn-sp-outline" onClick={() => setPrimary(account._id)}>
                            Set Primary
                          </button>
                        )}
                        <button className="btn btn-sm btn-sp-outline" onClick={() => editAccount(account)}>
                          Edit
                        </button>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => deleteAccount(account._id)}>
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </div>
      </div>

      <ConfirmModal
        open={pinModalOpen}
        title="Transaction PIN required"
        onClose={() => {
          setPinModalOpen(false);
          setPendingOperation(null);
        }}
        confirmLabel={saving ? 'Verifying...' : 'Verify PIN'}
        cancelLabel="Cancel"
        onConfirm={confirmPin}
        disableConfirm={saving || !pin}
      >
        <div>
          <div className="mb-2 text-muted-sp small">Enter your 4 to 6 digit Transaction PIN to authorize this bank account change.</div>
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
