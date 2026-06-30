import React from 'react';
import { useSelector } from 'react-redux';
import PageHeader from '../../components/common/PageHeader';
import GlassCard from '../../components/common/GlassCard';
import FormInput from '../../components/common/FormInput';
import StatusBadge from '../../components/common/StatusBadge';
import AmountDisplay from '../../components/common/AmountDisplay';
import { userApi } from '../../services/userApi';
import useAsyncItems from '../../hooks/useAsyncItems';
import useFormState from '../../hooks/useFormState';

const blank = { payerEmail: '', amount: '', description: '' };

export default function MoneyRequestsPage() {
  const { user } = useSelector((s) => s.auth);
  const { items, error, setError, load } = useAsyncItems(userApi.listMoneyRequests, 'Unable to load money requests');
  const { form, change, reset } = useFormState(blank);

  const create = async (e) => {
    e.preventDefault();
    try {
      await userApi.createMoneyRequest({ ...form, amount: Number(form.amount) });
      reset();
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to create money request');
    }
  };

  const respond = async (id, status) => {
    await userApi.respondMoneyRequest(id, status);
    await load();
  };

  return (
    <div>
      <PageHeader title="Money Requests" subtitle="Create, accept, reject, and review payment requests." />
      {error && <div className="alert alert-danger py-2 small">{error}</div>}
      <div className="row g-4">
        <div className="col-lg-5">
          <GlassCard>
            <h5 className="fw-bold mb-3">Create Request</h5>
            <form onSubmit={create}>
              <FormInput label="Payer Email" name="payerEmail" type="email" value={form.payerEmail} onChange={change} required />
              <FormInput label="Amount" name="amount" type="number" value={form.amount} onChange={change} required />
              <FormInput label="Description" name="description" value={form.description} onChange={change} />
              <button className="btn btn-sp-primary px-4" type="submit">Create Request</button>
            </form>
          </GlassCard>
        </div>
        <div className="col-lg-7">
          <GlassCard>
            <h5 className="fw-bold mb-3">History</h5>
            <div className="d-flex flex-column gap-3">
              {items.map((item) => {
                const incoming = item.payerEmail === user?.email;
                return (
                  <div key={item._id} className="soft-card p-3">
                    <div className="d-flex flex-wrap justify-content-between gap-3">
                      <div>
                        <div className="fw-bold"><AmountDisplay amount={item.amount} /></div>
                        <div className="text-muted-sp small">{incoming ? 'Requested from you' : `Requested from ${item.payerEmail}`}</div>
                        <div className="text-muted-sp small">{item.description || '-'}</div>
                      </div>
                      <div className="text-end">
                        <StatusBadge status={item.status} />
                        {incoming && item.status === 'PENDING' && (
                          <div className="d-flex gap-2 mt-2">
                            <button className="btn btn-sm btn-success" onClick={() => respond(item._id, 'ACCEPTED')}>Accept</button>
                            <button className="btn btn-sm btn-danger" onClick={() => respond(item._id, 'REJECTED')}>Reject</button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
