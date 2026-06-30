import api from './api';

export const walletApi = {
  getWallet: () => api.get('/wallet').then((res) => res.data),
  createWallet: () => api.post('/wallet').then((res) => res.data),
  getBalance: () => api.get('/wallet/balance').then((res) => res.data),
  addMoney: (payload) => api.post('/wallet/add-money', payload).then((res) => res.data),
  transferMoney: (payload) => api.post('/wallet/transfer', payload).then((res) => res.data),
  getTransactions: (params) => api.get('/wallet/transactions', { params }).then((res) => res.data),
  getTransactionDetails: (transactionId) => api.get(`/wallet/transactions/${transactionId}`).then((res) => res.data)
};