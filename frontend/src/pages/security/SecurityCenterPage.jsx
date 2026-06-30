import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import PageHeader from '../../components/common/PageHeader';
import GlassCard from '../../components/common/GlassCard';
import MetricCard from '../../components/common/MetricCard';
import StatusBadge from '../../components/common/StatusBadge';
import AmountDisplay from '../../components/common/AmountDisplay';
import { securityApi } from '../../services/securityApi';
import { updateUser } from '../../store/authSlice';
import useFormState from '../../hooks/useFormState';
import useAsyncData from '../../hooks/useAsyncData';

const pinBlank = { pin: '', confirmPin: '', currentPin: '', newPin: '', confirmNewPin: '', verifyPin: '' };

export default function SecurityCenterPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { data: overview, error: loadError, refresh } = useAsyncData(securityApi.getOverview, 'Unable to load security center');
  const { data: securityLogData, loading: logsLoading, error: logsError, refresh: refreshLogs } = useAsyncData(securityApi.getSecurityLogs, 'Unable to load security activity');
  const { form: pinForm, change: changePinForm, reset: resetPinForm } = useFormState(pinBlank);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [logSearch, setLogSearch] = useState('');
  const [logCategory, setLogCategory] = useState('ALL');

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

  const handlePinChange = (e) => {
    e.target.value = e.target.value.replace(/\D/g, '');
    changePinForm(e);
    setMessage('');
    setError('');
  };

  const submit = async (type) => {
    try {
      if (type === 'create') {
        const strengthErr = validateStrength(pinForm.pin);
        if (strengthErr) {
          setError(strengthErr);
          return;
        }
        if (pinForm.pin !== pinForm.confirmPin) {
          setError('PINs do not match');
          return;
        }
        await securityApi.createPin({ pin: pinForm.pin, confirmPin: pinForm.confirmPin });
        dispatch(updateUser({ hasTransactionPin: true }));
      }
      if (type === 'update') {
        const strengthErr = validateStrength(pinForm.newPin);
        if (strengthErr) {
          setError(strengthErr);
          return;
        }
        if (pinForm.newPin !== pinForm.confirmNewPin) {
          setError('PINs do not match');
          return;
        }
        await securityApi.updatePin({ currentPin: pinForm.currentPin, newPin: pinForm.newPin, confirmPin: pinForm.confirmNewPin });
        dispatch(updateUser({ hasTransactionPin: true }));
      }
      if (type === 'verify') {
        await securityApi.verifyPin({ pin: pinForm.verifyPin });
      }
      resetPinForm();
      setMessage(type === 'verify' ? 'Transaction PIN verified' : 'Transaction PIN saved');
      await refresh();
      await refreshLogs();
    } catch (err) {
      setError(err.response?.data?.message || 'PIN action failed');
    }
  };

  const securityLogs = securityLogData?.items || [];
  const filteredLogs = securityLogs.filter((log) => {
    const haystack = `${log.action || ''} ${log.status || ''} ${log.statusMessage || ''} ${log.resource || ''}`.toLowerCase();
    const matchesSearch = !logSearch || haystack.includes(logSearch.toLowerCase());
    const matchesCategory =
      logCategory === 'ALL' ||
      (logCategory === 'PIN' && String(log.action || '').includes('TRANSACTION_PIN')) ||
      (logCategory === 'BANK' && String(log.action || '').includes('BANK')) ||
      (logCategory === 'FAILED' && log.status === 'FAILURE');
    return matchesSearch && matchesCategory;
  });

  return (
    <div>
      <PageHeader title="Security Center" subtitle="Manage transaction PIN, devices, sessions, and security alerts.">
        <button className="btn btn-sp-outline" onClick={() => navigate('/security-center/login-history')}>Login History</button>
        <button className="btn btn-sp-primary" onClick={() => navigate('/security-center/devices')}>Devices</button>
      </PageHeader>

      {message && <div className="alert alert-success py-2 small">{message}</div>}
      {(error || loadError) && <div className="alert alert-danger py-2 small">{error || loadError}</div>}

      <div className="row g-4 mb-4">
        <div className="col-md-6">
          <MetricCard label="Transaction PIN" value={overview?.hasTransactionPin ? 'Enabled' : 'Not Set'} icon="bi-key" color="var(--sp-primary)" />
        </div>
        <div className="col-md-6">
          <MetricCard label="Active Devices" value={overview?.activeDeviceCount || 0} icon="bi-phone" color="var(--sp-warning)" />
        </div>
      </div>

      <div className="row g-4">
        <div className="col-xl-5">
          <GlassCard>
            <h5 className="fw-bold mb-3">{overview?.hasTransactionPin ? 'Update Transaction PIN' : 'Create Transaction PIN'}</h5>
            {!overview?.hasTransactionPin ? (
               <>
                 <input className="form-control mb-3" name="pin" type="password" inputMode="numeric" maxLength={6} placeholder="New PIN" value={pinForm.pin} onChange={handlePinChange} />
                 <input className="form-control mb-3" name="confirmPin" type="password" inputMode="numeric" maxLength={6} placeholder="Confirm PIN" value={pinForm.confirmPin} onChange={handlePinChange} />
                 <button className="btn btn-sp-primary" onClick={() => submit('create')}>Create PIN</button>
               </>
            ) : (
               <>
                 <input className="form-control mb-3" name="currentPin" type="password" inputMode="numeric" maxLength={6} placeholder="Current PIN" value={pinForm.currentPin} onChange={handlePinChange} />
                 <input className="form-control mb-3" name="newPin" type="password" inputMode="numeric" maxLength={6} placeholder="New PIN" value={pinForm.newPin} onChange={handlePinChange} />
                 <input className="form-control mb-3" name="confirmNewPin" type="password" inputMode="numeric" maxLength={6} placeholder="Confirm New PIN" value={pinForm.confirmNewPin} onChange={handlePinChange} />
                 <div className="d-flex align-items-center justify-content-between mb-4">
                   <button className="btn btn-sp-primary" onClick={() => submit('update')}>Update PIN</button>
                   <button className="btn btn-link btn-sm text-decoration-none text-muted-sp p-0" onClick={() => navigate('/profile/security/forgot-pin')}>
                     Forgot PIN?
                   </button>
                 </div>
                 <hr style={{ borderColor: 'var(--sp-border)' }} />
                 <input className="form-control mb-3" name="verifyPin" type="password" inputMode="numeric" maxLength={6} placeholder="Verify PIN" value={pinForm.verifyPin} onChange={handlePinChange} />
                 <button className="btn btn-sp-outline" onClick={() => submit('verify')}>Verify PIN</button>
               </>
            )}
          </GlassCard>
        </div>

        <div className="col-xl-7">
          <GlassCard className="mb-4">
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
              <h5 className="fw-bold mb-0">Security Activity Logs</h5>
              <div className="d-flex flex-wrap gap-2">
                <input
                  className="form-control form-control-sm"
                  style={{ maxWidth: 220 }}
                  placeholder="Search activity"
                  value={logSearch}
                  onChange={(e) => setLogSearch(e.target.value)}
                />
                <select
                  className="form-select form-select-sm"
                  style={{ maxWidth: 160 }}
                  value={logCategory}
                  onChange={(e) => setLogCategory(e.target.value)}
                >
                  <option value="ALL">All events</option>
                  <option value="PIN">PIN events</option>
                  <option value="BANK">Bank events</option>
                  <option value="FAILED">Failed attempts</option>
                </select>
              </div>
            </div>
            {logsError && <div className="alert alert-danger py-2 small">{logsError}</div>}
            {logsLoading ? (
              <p className="text-muted-sp mb-0">Loading activity...</p>
            ) : filteredLogs.length === 0 ? (
              <p className="text-muted-sp mb-0">No matching security activity.</p>
            ) : (
              <div className="d-flex flex-column gap-2">
                {filteredLogs.map((log) => (
                  <div key={log._id} className="soft-card p-3">
                    <div className="d-flex flex-wrap justify-content-between gap-2">
                      <div>
                        <div className="fw-bold">{String(log.action || '').replaceAll('_', ' ')}</div>
                        <div className="text-muted-sp small">
                          {log.statusMessage || log.resource || 'Security event'}
                        </div>
                        <div className="text-muted-sp small">
                          {log.ipAddress || 'IP unavailable'} {log.userAgent ? `- ${log.userAgent.slice(0, 48)}` : ''}
                        </div>
                      </div>
                      <div className="text-end">
                        <StatusBadge status={log.status || 'SUCCESS'} />
                        <div className="text-muted-sp small mt-1">
                          {log.createdAt ? new Date(log.createdAt).toLocaleString() : '-'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>

          <GlassCard className="mb-4">
            <h5 className="fw-bold mb-3">Security Alerts</h5>
            {(overview?.securityAlerts || []).length === 0 ? <p className="text-muted-sp mb-0">No security alerts.</p> : overview.securityAlerts.map((alert) => (
              <div key={alert._id} className="soft-card p-3 mb-2">
                <div className="d-flex justify-content-between gap-3">
                  <div>
                    <div className="fw-bold">{alert.title}</div>
                    <div className="text-muted-sp small">{alert.message}</div>
                  </div>
                  <StatusBadge status={alert.priority} />
                </div>
              </div>
            ))}
          </GlassCard>

          <GlassCard>
            <h5 className="fw-bold mb-3">Fraud Alerts</h5>
            {(overview?.fraudAlerts || []).length === 0 ? <p className="text-muted-sp mb-0">No fraud alerts.</p> : overview.fraudAlerts.map((txn) => (
              <div key={txn._id} className="soft-card p-3 mb-2">
                <div className="d-flex justify-content-between gap-3">
                  <div>
                    <div className="fw-bold">{txn.transactionId}</div>
                    <div className="text-muted-sp small">{txn.fraudReason || txn.type}</div>
                  </div>
                  <div className="text-end">
                    <AmountDisplay amount={txn.amount} />
                    <div className="text-danger fw-bold small">{txn.fraudScore || 0}/100</div>
                  </div>
                </div>
              </div>
            ))}
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
