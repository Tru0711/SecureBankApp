import React, { useEffect, useState } from 'react';
import PageHeader from './PageHeader';
import GlassCard from './GlassCard';
import FormInput from './FormInput';

export default function CrudResourcePage({
  title,
  subtitle,
  blank,
  fields,
  listApi,
  createApi,
  updateApi,
  deleteApi,
  mapItemToForm,
  preparePayload = (form) => form,
  getItemTitle,
  renderItemMeta,
  renderBadges,
  extraActions,
  confirmDeleteMessage = 'Delete this item?',
  loadErrorMessage = 'Unable to load items',
  saveErrorMessage = 'Unable to save item'
}) {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(blank);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');

  const load = async () => {
    const res = await listApi();
    setItems(res.data.items || []);
  };

  useEffect(() => {
    load().catch((err) => setError(err.response?.data?.message || loadErrorMessage));
  }, []);

  const change = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const reset = () => {
    setEditingId(null);
    setForm(blank);
  };

  const save = async (e) => {
    e.preventDefault();
    try {
      const payload = preparePayload(form);
      if (editingId) await updateApi(editingId, payload);
      else await createApi(payload);
      reset();
      await load();
    } catch (err) {
      setError(err.response?.data?.message || saveErrorMessage);
    }
  };

  const edit = (item) => {
    setEditingId(item._id);
    setForm(mapItemToForm(item));
  };

  const remove = async (id) => {
    if (!window.confirm(confirmDeleteMessage)) return;
    await deleteApi(id);
    await load();
  };

  const renderField = (field) => {
    if (field.type === 'checkbox') {
      return (
        <label key={field.name} className="d-flex align-items-center gap-2 mb-4 text-muted-sp">
          <input type="checkbox" name={field.name} checked={Boolean(form[field.name])} onChange={change} />
          {field.label}
        </label>
      );
    }

    return (
      <FormInput
        key={field.name}
        label={field.label}
        name={field.name}
        type={field.type || 'text'}
        value={form[field.name]}
        onChange={change}
        required={field.required}
      />
    );
  };

  return (
    <div>
      <PageHeader title={title} subtitle={subtitle} />
      {error && <div className="alert alert-danger py-2 small">{error}</div>}
      <div className="row g-4">
        <div className="col-lg-5">
          <GlassCard>
            <h5 className="fw-bold mb-3">{editingId ? `Edit ${title.slice(0, -1)}` : `Add ${title.slice(0, -1)}`}</h5>
            <form onSubmit={save}>
              {fields.map(renderField)}
              <button className="btn btn-sp-primary px-4" type="submit">{editingId ? 'Update' : 'Add'}</button>
              {editingId && <button className="btn btn-sp-outline ms-2" type="button" onClick={reset}>Cancel</button>}
            </form>
          </GlassCard>
        </div>
        <div className="col-lg-7">
          <div className="d-flex flex-column gap-3">
            {items.map((item) => (
              <GlassCard key={item._id}>
                <div className="d-flex flex-wrap justify-content-between gap-3">
                  <div>
                    <h5 className="fw-bold mb-1">{getItemTitle(item)}</h5>
                    {renderItemMeta(item)}
                    {renderBadges?.(item)}
                  </div>
                  <div className="d-flex flex-wrap gap-2 align-content-start">
                    {extraActions?.(item, load)}
                    <button className="btn btn-sm btn-sp-outline" onClick={() => edit(item)}>Edit</button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => remove(item._id)}>Delete</button>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
