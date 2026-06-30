import api from './api';

export const userApi = {
  getProfile: () => api.get('/users/profile').then((res) => res.data),
  completeProfile: (payload) => api.put('/users/complete-profile', payload).then((res) => res.data),
  getOnboardingStatus: () => api.get('/users/onboarding-status').then((res) => res.data),

  listBankAccounts: () => api.get('/users/bank-accounts').then((res) => res.data),
  addBankAccount: (payload) => api.post('/users/bank-accounts', payload).then((res) => res.data),
  updateBankAccount: (id, payload) => api.put(`/users/bank-accounts/${id}`, payload).then((res) => res.data),
  deleteBankAccount: (id, payload) => api.delete(`/users/bank-accounts/${id}`, { data: payload }).then((res) => res.data),
  setPrimaryBankAccount: (id, payload = {}) => api.put(`/users/bank-accounts/${id}`, { ...payload, isPrimary: true }).then((res) => res.data),

  getKyc: () => api.get('/users/kyc').then((res) => res.data),
  submitKyc: (payload) => api.post('/users/kyc', payload).then((res) => res.data),

  listBeneficiaries: () => api.get('/users/beneficiaries').then((res) => res.data),
  createBeneficiary: (payload) => api.post('/users/beneficiaries', payload).then((res) => res.data),
  updateBeneficiary: (id, payload) => api.put(`/users/beneficiaries/${id}`, payload).then((res) => res.data),
  deleteBeneficiary: (id) => api.delete(`/users/beneficiaries/${id}`).then((res) => res.data),
  favoriteBeneficiary: (id, isFavorite) => api.put(`/users/beneficiaries/${id}`, { isFavorite }).then((res) => res.data),

  listNominees: () => api.get('/users/nominees').then((res) => res.data),
  createNominee: (payload) => api.post('/users/nominees', payload).then((res) => res.data),
  updateNominee: (id, payload) => api.put(`/users/nominees/${id}`, payload).then((res) => res.data),
  deleteNominee: (id) => api.delete(`/users/nominees/${id}`).then((res) => res.data),

  listEmergencyContacts: () => api.get('/users/emergency-contacts').then((res) => res.data),
  createEmergencyContact: (payload) => api.post('/users/emergency-contacts', payload).then((res) => res.data),
  updateEmergencyContact: (id, payload) => api.put(`/users/emergency-contacts/${id}`, payload).then((res) => res.data),
  deleteEmergencyContact: (id) => api.delete(`/users/emergency-contacts/${id}`).then((res) => res.data),

  listMoneyRequests: () => api.get('/users/money-requests').then((res) => res.data),
  createMoneyRequest: (payload) => api.post('/users/money-requests', payload).then((res) => res.data),
  respondMoneyRequest: (id, status) => api.put(`/users/money-requests/${id}/respond`, { status }).then((res) => res.data),

  listSupportTickets: () => api.get('/users/support-tickets').then((res) => res.data),
  createSupportTicket: (payload) => api.post('/users/support-tickets', payload).then((res) => res.data),
  getSupportTicket: (id) => api.get(`/users/support-tickets/${id}`).then((res) => res.data),
  replySupportTicket: (id, message) => api.post(`/users/support-tickets/${id}/replies`, { message }).then((res) => res.data)
};
