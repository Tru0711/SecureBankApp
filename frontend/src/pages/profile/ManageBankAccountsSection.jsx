import React, { useEffect, useMemo, useState } from 'react';

import GlassCard from '../../components/common/GlassCard';
import FormInput from '../../components/common/FormInput';
import ConfirmModal from '../../components/common/ConfirmModal';
import LoadingSpinner from '../../components/common/LoadingSpinner';

import { userApi } from '../../services/userApi';
import { validatePinFormat } from '../../utils/validators';

const PIN_HELPER = 'Enter your Transaction PIN to continue.';

function MaskedPinHint() {
  return (
    <small className="text-muted-sp d-block mt-1">
      {PIN_HELPER}
    </small>
  );
}

export default function ManageBankAccountsSection({}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState('');

  // Modal / PIN gate
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [pinLoading, setPinLoading] = useState(false);
  const [pinSuccessMsg, setPinSuccessMsg] = useState('');
  const [failedAttempts, setFailedAttempts] = useState(0);
  const MAX_ATTEMPTS = 5;

  // Pending operation to execute after PIN verification
  const [pendingOp, setPendingOp] = useState(null);

  const canSubmitPin = useMemo(() => validatePinFormat(pin) && !pinLoading, [pin, pinLoading]);

  const fetchAccounts = async () => {
    setLoading(true);
    setFetchError('');
    try {
      const res = await userApi.listBankAccounts();
      setItems(res?.data?.items || res?.data?.items || res?.items || []);
    } catch (e) {
      setFetchError(e?.response?.data?.message || 'Unable to load bank accounts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openPinModalFor = (op) => {
    setPin('');
    setPinError('');
    setPinSuccessMsg('');
    setFailedAttempts(0);
    setPendingOp(() => op);
    setPinModalOpen(true);
  };

  const executeWithPin = async (pinValue) => {
    if (!pendingOp) return;
    return pendingOp(pinValue);
  };

  const handleConfirmPin = async () => {
    setPinError('');

    if (!validatePinFormat(pin)) {
      setPinError('Transaction PIN must be 4 to 6 digits');
      return;
    }
    if (failedAttempts >= MAX_ATTEMPTS) {
      setPinError(`Too many incorrect attempts. Please try again later.`);
      return;
    }

    setPinLoading(true);
    setPinSuccessMsg('');
    try {
      await executeWithPin(pin);
      setPinSuccessMsg('Success');
      setPinModalOpen(false);
      setPendingOp(null);
      cancelEdit();
      fetchAccounts();
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || 'Transaction PIN verification failed';
      setPinError(msg);
      setFailedAttempts((v) => v + 1);
    } finally {
      setPinLoading(false);
    }
  };

  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    bankName: '',
    accountHolderName: '',
    accountNumber: '',
    confirmAccountNumber: '',
    ifsc: '',
    branch: '',
    accountType: 'SAVINGS',
    isPrimary: false,
  });

  const startEdit = (acc) => {
    setEditingId(acc._id || acc.id);
    setForm({
      bankName: acc.bankName || '',
      accountHolderName: acc.accountHolderName || '',
      accountNumber: '',
      confirmAccountNumber: '',
      ifsc: acc.ifsc || '',
      branch: acc.branch || '',
      accountType: acc.accountType || 'SAVINGS',
      isPrimary: Boolean(acc.isPrimary),
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({
      bankName: '',
      accountHolderName: '',
      accountNumber: '',
      confirmAccountNumber: '',
      ifsc: '',
      branch: '',
      accountType: 'SAVINGS',
      isPrimary: false,
    });
  };

  const handleSave = () => {
    if (!editingId) return;
    if (!form.bankName || !form.accountHolderName || !form.ifsc) {
      setPinError('Please fill all required bank fields');
      return;
    }

    openPinModalFor(async (pinValue) => {
      const payload = {
        bankName: form.bankName,
        accountHolderName: form.accountHolderName,
        ifsc: form.ifsc,
        branch: form.branch,
        accountType: form.accountType,
        isPrimary: form.isPrimary,
        transactionPin: pinValue,
      };
      const res = await userApi.updateBankAccount(editingId, payload);
      return res;
    });
  };

  const handleDelete = (id) => {
    openPinModalFor(async (pinValue) => {
      await userApi.deleteBankAccount(id, { transactionPin: pinValue });
    });
  };

  const handleAdd = () => {
    if (!form.bankName || !form.accountHolderName || !form.accountNumber || !form.confirmAccountNumber || !form.ifsc) {
      setPinError('Please fill all required bank fields');
      return;
    }

    openPinModalFor(async (pinValue) => {
      const payload = {
        ...form,
        transactionPin: pinValue,
      };
      await userApi.addBankAccount(payload);
    });
  };

  return (
    <div className="mt-4">
      <h5 className="fw-bold mb-3">Manage Bank Accounts</h5>

      <GlassCard className="p-4">
        {loading ? (
          <LoadingSpinner />
        ) : fetchError ? (
          <div className="alert alert-danger py-2 small">{fetchError}</div>
        ) : (
          <>
            {items.length === 0 ? (
              <div className="text-muted-sp small">No bank accounts linked yet.</div>
            ) : (
              <div className="row g-3">
                {items.map((acc) => (
                  <div className="col-lg-6" key={acc._id || acc.id}>
                    <div className="glass-card p-3" style={{ borderRadius: 16 }}>
                      <div className="d-flex align-items-start justify-content-between gap-3">
                        <div>
                          <div className="fw-bold">{acc.bankName}</div>
                          <div className="text-muted-sp small">{acc.accountHolderName}</div>
                          <div className="text-muted-sp small mt-2">{acc.maskedAccountNumber || acc.maskedAccount || ''}</div>
                          {acc.isPrimary ? (
                            <span className="badge badge-soft-success mt-2">Default</span>
                          ) : null}
                        </div>
                        <div className="d-flex flex-column gap-2">
                          <button className="btn btn-sp-outline btn-sm" onClick={() => startEdit(acc)}>
                            <i className="bi bi-pencil me-1" /> Edit
                          </button>
                          <button className="btn btn-sp-outline-danger btn-sm" onClick={() => handleDelete(acc._id || acc.id)}>
                            <i className="bi bi-trash me-1" /> Remove
                          </button>
                        </div>
                      </div>
                      {!acc.isPrimary ? (
                        <div className="mt-3">
                          <button
                            className="btn btn-sp-primary w-100"
                            onClick={() =>
                              openPinModalFor(async (pinValue) => {
                                // setPrimary via update endpoint
                                await userApi.updateBankAccount(acc._id || acc.id, { isPrimary: true, transactionPin: pinValue });
                              })
                            }
                          >
                            Set as default
                          </button>
                        </div>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </GlassCard>

      <GlassCard className="p-4 mt-4">
        <h6 className="fw-bold mb-3">{editingId ? 'Edit bank account' : 'Add bank account'}</h6>

        <div className="row g-3">
          <div className="col-md-6">
            <FormInput label="Bank Name" name="bankName" value={form.bankName} onChange={(e) => setForm((p) => ({ ...p, bankName: e.target.value }))} required />
          </div>
          <div className="col-md-6">
            <FormInput label="Account Holder Name" name="accountHolderName" value={form.accountHolderName} onChange={(e) => setForm((p) => ({ ...p, accountHolderName: e.target.value }))} required />
          </div>
          <div className="col-md-6">
            <FormInput label="Account Number" name="accountNumber" type="password" inputMode="numeric" value={form.accountNumber} onChange={(e) => setForm((p) => ({ ...p, accountNumber: e.target.value }))} required />
          </div>
          <div className="col-md-6">
            <FormInput label="Confirm Account Number" name="confirmAccountNumber" type="password" inputMode="numeric" value={form.confirmAccountNumber} onChange={(e) => setForm((p) => ({ ...p, confirmAccountNumber: e.target.value }))} required />
          </div>
          <div className="col-md-6">
            <FormInput label="IFSC" name="ifsc" value={form.ifsc} onChange={(e) => setForm((p) => ({ ...p, ifsc: e.target.value }))} required />
          </div>
          <div className="col-md-6">
            <FormInput label="Branch" name="branch" value={form.branch} onChange={(e) => setForm((p) => ({ ...p, branch: e.target.value }))} />
          </div>
        </div>

        <div className="d-flex align-items-center justify-content-between mt-4 gap-3">
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              checked={form.isPrimary}
              onChange={(e) => setForm((p) => ({ ...p, isPrimary: e.target.checked }))}
              id="isPrimary"
            />
            <label className="form-check-label" htmlFor="isPrimary">Set as default</label>
          </div>

          <div className="d-flex gap-2">
            {editingId ? (
              <button className="btn btn-sp-outline" onClick={cancelEdit} type="button">
                Cancel
              </button>
            ) : null}
            <button
              className="btn btn-sp-primary"
              onClick={() => (editingId ? handleSave() : handleAdd())}
              type="button"
            >
              {editingId ? 'Save changes' : 'Add bank account'}
            </button>
          </div>
        </div>
      </GlassCard>

      <ConfirmModal
        open={pinModalOpen}
        title="Transaction PIN required"
        onClose={() => {
          setPinModalOpen(false);
          setPendingOp(null);
        }}
        confirmLabel={pinLoading ? 'Verifying...' : 'Verify PIN'}
        cancelLabel="Cancel"
        onConfirm={handleConfirmPin}
        disableConfirm={!canSubmitPin}
      >
        <div>
          <div className="mb-2 text-muted-sp small">Verify your Transaction PIN to continue.</div>
          <input
            className="form-control"
            type="password"
            inputMode="numeric"
            maxLength={6}
            placeholder="4 to 6 digit PIN"
            value={pin}
            onChange={(e) => {
              setPin(e.target.value.replace(/\D/g, ''));
              setPinError('');
            }}
          />
          {pinError ? <div className="text-danger small mt-2">{pinError}</div> : null}
          {pinSuccessMsg ? <div className="text-success small mt-2">{pinSuccessMsg}</div> : null}
          <MaskedPinHint />
          <div className="text-muted-sp small mt-2">
            Attempts used: {failedAttempts} / {MAX_ATTEMPTS}
          </div>
        </div>
      </ConfirmModal>
    </div>
  );
}

