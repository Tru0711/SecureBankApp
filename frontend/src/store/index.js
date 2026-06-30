import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import walletReducer from './walletSlice';
import transactionReducer from './transactionSlice';
import notificationReducer from './notificationSlice';
import uiReducer from './uiSlice';
import moneyRequestsReducer from './moneyRequestsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    wallet: walletReducer,
    transaction: transactionReducer,
    notification: notificationReducer,
    moneyRequests: moneyRequestsReducer,
    ui: uiReducer
  }
});
