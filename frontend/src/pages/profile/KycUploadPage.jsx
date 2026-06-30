import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import GlassCard from '../../components/common/GlassCard';
import { setCredentials } from '../../store/authSlice';
import { userApi } from '../../services/userApi';

export default function KycUploadPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { accessToken } = useSelector((s) => s.auth);

  const [files, setFiles] = useState({
    aadhaarFrontImage: null,
    aadhaarBackImage: null,
    panImage: null,
    selfieImage: null,
    passbookImage: null
  });

  const [form, setForm] = useState({
    panNumber: '',
    aadhaarNumber: '',
    address: '',
    dob: ''
  });

  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [error, setError] = useState('');

  const onChangeForm = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const handleFile = (key) => (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFiles((prev) => ({ ...prev, [key]: file }));
      setError('');
    }
  };

  const hasAll =
    files.aadhaarFrontImage &&
    files.aadhaarBackImage &&
    files.panImage &&
    files.selfieImage &&
    form.panNumber.trim() &&
    form.aadhaarNumber.trim() &&
    form.address.trim() &&
    form.dob;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!hasAll) return;
    setUploading(true);

    try {
      // 1) Upload docs (multipart)
      const uploadData = new FormData();
      uploadData.append('panImage', files.panImage);
      uploadData.append('aadhaarFrontImage', files.aadhaarFrontImage);
      uploadData.append('aadhaarBackImage', files.aadhaarBackImage);
      uploadData.append('selfieImage', files.selfieImage);
      if (files.passbookImage) uploadData.append('passbookImage', files.passbookImage);

      const axiosMod = await import('../../services/api');
      const api = axiosMod.default;
      const uploadRes = await api.post('/users/kyc/upload', uploadData);

      const urls = uploadRes?.data?.data?.urls || {};

      // 2) Submit extracted KYC fields + uploaded URLs
      const payload = {
        panNumber: form.panNumber,
        aadhaarNumber: form.aadhaarNumber,
        address: form.address,
        dob: form.dob,
        documents: {
          panImageUrl: urls.panImageUrl,
          aadhaarFrontImageUrl: urls.aadhaarFrontImageUrl,
          aadhaarBackImageUrl: urls.aadhaarBackImageUrl,
          selfieImageUrl: urls.selfieImageUrl,
          passbookImageUrl: urls.passbookImageUrl
        }
      };

      await userApi.submitKyc(payload);

      const profile = await userApi.getProfile();
      dispatch(setCredentials({ user: profile.data.user, accessToken }));

      setUploaded(true);
      setTimeout(() => navigate('/onboarding/await-approval', { replace: true }), 900);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to submit KYC');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <PageHeader title="KYC Verification" subtitle="Upload your documents for verification" />
      {error && <div className="alert alert-danger py-2 small">{error}</div>}

      {uploaded ? (
        <GlassCard className="text-center py-5">
          <i className="bi bi-check-circle-fill display-3 mb-3" style={{ color: 'var(--sp-success)' }} />
          <h3 className="fw-bold mb-2">Documents Submitted!</h3>
          <p className="text-muted-sp">Your KYC documents are under review. This usually takes 24-48 hours.</p>
        </GlassCard>
      ) : (
        <div className="row g-4">
          <div className="col-lg-8">
            <GlassCard>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="form-label fw-semibold text-muted-sp">PAN Number</label>
                  <input
                    value={form.panNumber}
                    onChange={onChangeForm('panNumber')}
                    className="form-control"
                    placeholder="e.g., ABCDE1234F"
                    autoComplete="off"
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label fw-semibold text-muted-sp">Aadhaar Number</label>
                  <input
                    value={form.aadhaarNumber}
                    onChange={onChangeForm('aadhaarNumber')}
                    className="form-control"
                    placeholder="e.g., 1234 5678 9012"
                    autoComplete="off"
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label fw-semibold text-muted-sp">Address</label>
                  <textarea
                    value={form.address}
                    onChange={onChangeForm('address')}
                    className="form-control"
                    rows={3}
                    placeholder="Enter full address"
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label fw-semibold text-muted-sp">Date of Birth</label>
                  <input
                    type="date"
                    value={form.dob}
                    onChange={onChangeForm('dob')}
                    className="form-control"
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label fw-semibold text-muted-sp">Aadhaar Front Image</label>
                  <div className="input-group">
                    <input
                      type="file"
                      className="form-control"
                      accept="image/*,.pdf"
                      onChange={handleFile('aadhaarFrontImage')}
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label fw-semibold text-muted-sp">Aadhaar Back Image</label>
                  <div className="input-group">
                    <input
                      type="file"
                      className="form-control"
                      accept="image/*,.pdf"
                      onChange={handleFile('aadhaarBackImage')}
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label fw-semibold text-muted-sp">PAN Card Image</label>
                  <div className="input-group">
                    <input
                      type="file"
                      className="form-control"
                      accept="image/*,.pdf"
                      onChange={handleFile('panImage')}
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label fw-semibold text-muted-sp">Selfie / Photo</label>
                  <div className="input-group">
                    <input
                      type="file"
                      className="form-control"
                      accept="image/*"
                      onChange={handleFile('selfieImage')}
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label fw-semibold text-muted-sp">Passbook / Bank Proof (Optional)</label>
                  <div className="input-group">
                    <input
                      type="file"
                      className="form-control"
                      accept="image/*,.pdf"
                      onChange={handleFile('passbookImage')}
                    />
                  </div>
                </div>

                <button type="submit" className="btn btn-sp-primary px-5 py-2" disabled={!hasAll || uploading}>
                  {uploading ? (
                    <span className="spinner-border spinner-border-sm me-2" role="status" />
                  ) : null}
                  {uploading ? 'Uploading...' : 'Submit Documents'}
                </button>
              </form>
            </GlassCard>
          </div>

          <div className="col-lg-4">
            <GlassCard>
              <h5 className="fw-bold mb-3">KYC Checklist</h5>
              <ul className="list-unstyled d-flex flex-column gap-2 small text-muted-sp">
                <li className="d-flex align-items-center gap-2">
                  <i className={`bi ${files.aadhaarFrontImage && files.aadhaarBackImage ? 'bi-check-circle-fill text-success' : 'bi-circle'}`} />
                  Govt. ID (Aadhaar Front + Back)
                </li>
                <li className="d-flex align-items-center gap-2">
                  <i className={`bi ${files.panImage ? 'bi-check-circle-fill text-success' : 'bi-circle'}`} />
                  PAN Card
                </li>
                <li className="d-flex align-items-center gap-2">
                  <i className={`bi ${files.selfieImage ? 'bi-check-circle-fill text-success' : 'bi-circle'}`} />
                  Selfie Photo
                </li>
                <li className="d-flex align-items-center gap-2">
                  <i className={`bi ${files.passbookImage ? 'bi-check-circle-fill text-success' : 'bi-circle'}`} />
                  Passbook / Bank Proof (Optional)
                </li>
              </ul>

              <hr style={{ borderColor: 'var(--sp-border)' }} />

              <p className="small text-muted-sp mb-0">
                Your documents are securely stored. Admin review happens before approval or rejection.
              </p>
            </GlassCard>
          </div>
        </div>
      )}
    </div>
  );
}

