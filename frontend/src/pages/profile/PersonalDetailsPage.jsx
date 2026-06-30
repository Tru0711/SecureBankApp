import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import PageHeader from '../../components/common/PageHeader';
import GlassCard from '../../components/common/GlassCard';
import FormInput from '../../components/common/FormInput';
import {
  validateName,
  validatePhone,
  validateEmail,
  getFormErrors,
  isValidForm,
} from '../../utils/validators';

import ManageBankAccountsSection from './ManageBankAccountsSection';

export default function PersonalDetailsPage() {

  const { user } = useSelector((s) => s.auth);
  const [form, setForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });
  const [errors, setErrors] = useState({});
  const [saved, setSaved] = useState(false);

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
    });
    setErrors(validationErrors);
    if (isValidForm(validationErrors)) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  return (
    <div>
      <PageHeader title="Personal Details" subtitle="Manage your personal information" />

      <div className="row g-4">
        <div className="col-lg-8">
          <ManageBankAccountsSection />
        </div>
        <div className="col-lg-4">


          <GlassCard className="text-center">

            <div
              className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
              style={{ width: 96, height: 96, background: 'linear-gradient(135deg, var(--sp-primary), var(--sp-primary-2))' }}
            >
              <span className="fw-bold" style={{ fontSize: '2rem', color: '#07111c' }}>
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </span>
            </div>
            <h5 className="fw-bold">{user?.firstName} {user?.lastName}</h5>
            <p className="text-muted-sp small mb-1">{user?.email}</p>
            <span className={`status-pill badge-soft-${user?.kycStatus === 'VERIFIED' ? 'success' : 'warning'}`}>
              KYC: {user?.kycStatus || 'PENDING'}
            </span>
          </GlassCard>
        </div>

        <div className="col-lg-8">
          <GlassCard>
            {saved && (

              <div className="alert alert-success py-2 small" role="alert">
                <i className="bi bi-check-circle me-2" />Profile updated successfully
              </div>
            )}
            <form onSubmit={handleSubmit}>
               

              <div className="row">
                <div className="col-6">
                  <FormInput label="First Name" name="firstName" value={form.firstName} onChange={handleChange} error={errors.firstName} required />
                </div>
                <div className="col-6">
                  <FormInput label="Last Name" name="lastName" value={form.lastName} onChange={handleChange} error={errors.lastName} required />
                </div>
              </div>
              <FormInput label="Email" name="email" type="email" value={form.email} onChange={handleChange} error={errors.email} required />
              <FormInput label="Phone" name="phone" type="tel" value={form.phone} onChange={handleChange} error={errors.phone} required />

              <button type="submit" className="btn btn-sp-primary px-5 py-2">Save Changes</button>
            </form>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
