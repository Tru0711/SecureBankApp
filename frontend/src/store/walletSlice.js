import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { walletApi } from '../services/walletApi';

export const fetchWallet = createAsyncThunk('wallet/fetchWallet', async (_, { rejectWithValue }) => {
  try {
    return await walletApi.getWallet();
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Unable to load wallet');
  }
});

export const fetchBalance = createAsyncThunk('wallet/fetchBalance', async (_, { rejectWithValue }) => {
  try {
    return await walletApi.getBalance();
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Unable to load balance');
  }
});

export const createWallet = createAsyncThunk('wallet/createWallet', async (_, { rejectWithValue }) => {
  try {
    return await walletApi.createWallet();
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Unable to create wallet');
  }
});

export const addMoney = createAsyncThunk('wallet/addMoney', async (payload, { rejectWithValue }) => {
  try {
    return await walletApi.addMoney(payload);
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Unable to add money');
  }
});

export const transferMoney = createAsyncThunk('wallet/transferMoney', async (payload, { rejectWithValue }) => {
  try {
    return await walletApi.transferMoney(payload);
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Unable to send money');
  }
});

export const fetchTransactions = createAsyncThunk('wallet/fetchTransactions', async (params, { rejectWithValue }) => {
  try {
    return await walletApi.getTransactions(params);
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Unable to load transactions');
  }
});

const walletSlice = createSlice({
  name: 'wallet',
  initialState: {
    wallet: null,
    balance: null,
    transactions: [],
    pagination: null,
    status: 'idle',
    error: null
  },
  reducers: {
    setWalletFromDashboard(state, action) {
      state.wallet = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWallet.fulfilled, (state, action) => {
        state.wallet = action.payload.data.wallet;
      })
      .addCase(fetchBalance.fulfilled, (state, action) => {
        state.balance = action.payload.data.balance;
      })
      .addCase(createWallet.fulfilled, (state, action) => {
        state.wallet = action.payload.data.wallet;
      })
      .addCase(addMoney.fulfilled, (state, action) => {
        state.wallet = action.payload.data.wallet;
      })
      .addCase(transferMoney.fulfilled, (state, action) => {
        state.wallet = action.payload.data.senderWallet;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.transactions = action.payload.data.transactions;
        state.pagination = action.payload.data.pagination;
      });
  }
});

export const { setWalletFromDashboard } = walletSlice.actions;
export default walletSlice.reducer;