import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { walletApi } from '../services/walletApi';

export const loadTransactionDetails = createAsyncThunk('transaction/loadDetails', async (transactionId, { rejectWithValue }) => {
  try {
    return await walletApi.getTransactionDetails(transactionId);
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Unable to load transaction details');
  }
});

const transactionSlice = createSlice({
  name: 'transaction',
  initialState: {
    selectedTransaction: null,
    filters: {
      search: '',
      status: 'all',
      type: 'all'
    },
    status: 'idle',
    error: null
  },
  reducers: {
    setTransactionFilters(state, action) {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearSelectedTransaction(state) {
      state.selectedTransaction = null;
    }
  },
  extraReducers: (builder) => {
    builder.addCase(loadTransactionDetails.fulfilled, (state, action) => {
      state.selectedTransaction = action.payload.data.transaction;
    });
  }
});

export const { setTransactionFilters, clearSelectedTransaction } = transactionSlice.actions;
export default transactionSlice.reducer;