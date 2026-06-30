import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import GlassCard from '../../components/common/GlassCard';
import PageHeader from '../../components/common/PageHeader';
import FormInput from '../../components/common/FormInput';
import { setCredentials } from '../../store/authSlice';
import { userApi } from '../../services/userApi';
import { validateName, validatePhone, getFormErrors, isValidForm } from '../../utils/validators';

export default function CompleteProfilePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, accessToken } = useSelector((s) => s.auth);
  const [form, setForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
    gender: user?.gender || '',
    occupation: user?.occupation || '',
    annualIncome: user?.annualIncome || '',
    panNumber: user?.panNumber || '',
    aadhaarNumber: user?.aadhaarNumber || '',
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    zipCode: user?.address?.zipCode || ''
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: '' }));
    setApiError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = getFormErrors(form, {
      firstName: (v) => validateName(v, 'First name'),
      lastName: (v) => validateName(v, 'Last name'),
      phone: validatePhone,
      occupation: (v) => (!v ? 'Occupation is required' : ''),
      panNumber: (v) => (!v ? 'PAN number is required' : ''),
      aadhaarNumber: (v) => (!v ? 'Aadhaar number is required' : ''),
      city: (v) => (!v ? 'City is required' : ''),
      state: (v) => (!v ? 'State is required' : '')
    });
    setErrors(validationErrors);
    if (!isValidForm(validationErrors)) return;

    setSaving(true);
    try {
      const payload = {
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone,
        gender: form.gender || undefined,
        occupation: form.occupation,
        annualIncome: Number(form.annualIncome || 0),
        panNumber: form.panNumber,
        aadhaarNumber: form.aadhaarNumber,
        address: {
          street: form.street,
          city: form.city,
          state: form.state,
          zipCode: form.zipCode,
          country: 'IN'
        }
      };
      const res = await userApi.completeProfile(payload);
      dispatch(setCredentials({ user: res.data.user, accessToken }));
      navigate('/onboarding/bank', { replace: true });
    } catch (error) {
      setApiError(error.response?.data?.message || 'Unable to complete profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader title="Complete Profile" subtitle="Finish your personal details before adding bank information." />
      <GlassCard>
        {apiError && <div className="alert alert-danger py-2 small">{apiError}</div>}
        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-6">
              <FormInput label="First Name" name="firstName" value={form.firstName} onChange={handleChange} error={errors.firstName} required />
            </div>
            <div className="col-md-6">
              <FormInput label="Last Name" name="lastName" value={form.lastName} onChange={handleChange} error={errors.lastName} required />
            </div>
          </div>
          <div className="row">
            <div className="col-md-6">
              <FormInput label="Phone" name="phone" type="tel" value={form.phone} onChange={handleChange} error={errors.phone} required />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label fw-semibold text-muted-sp">Gender</label>
              <select name="gender" className="form-select" value={form.gender} onChange={handleChange}>
                <option value="">Select gender</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
                <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
              </select>
            </div>
          </div>
          <div className="row">
            <div className="col-md-6">
              <FormInput label="Occupation" name="occupation" value={form.occupation} onChange={handleChange} error={errors.occupation} required />
            </div>
            <div className="col-md-6">
              <FormInput label="Annual Income" name="annualIncome" type="number" value={form.annualIncome} onChange={handleChange} />
            </div>
          </div>
          <div className="row">
            <div className="col-md-6">
              <FormInput label="PAN Number" name="panNumber" value={form.panNumber} onChange={handleChange} error={errors.panNumber} required />
            </div>
            <div className="col-md-6">
              <FormInput label="Aadhaar Number" name="aadhaarNumber" value={form.aadhaarNumber} onChange={handleChange} error={errors.aadhaarNumber} required />
            </div>
          </div>
          <FormInput label="Street" name="street" value={form.street} onChange={handleChange} />
          <div className="row">
            <div className="col-md-4">
              <FormInput label="City" name="city" value={form.city} onChange={handleChange} error={errors.city} required />
            </div>
            <div className="col-md-4">
              <FormInput label="State" name="state" value={form.state} onChange={handleChange} error={errors.state} required />
            </div>
            <div className="col-md-4">
              <FormInput label="PIN Code" name="zipCode" value={form.zipCode} onChange={handleChange} />
            </div>
          </div>
          <button type="submit" className="btn btn-sp-primary px-5 py-2" disabled={saving}>
            {saving ? 'Saving...' : 'Save and Continue'}
          </button>
        </form>
      </GlassCard>
    </div>
  );
}
