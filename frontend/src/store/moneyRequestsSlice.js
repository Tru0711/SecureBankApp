import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { userApi } from '../services/userApi';

export const fetchMoneyRequests = createAsyncThunk('moneyRequests/fetch', async (_, { rejectWithValue }) => {
  try {
    const res = await userApi.listMoneyRequests();
    return res?.data?.items || res?.data || res;
  } catch (err) {
    return rejectWithValue(err?.response?.data?.message || 'Unable to load money requests');
  }
});

const moneyRequestsSlice = createSlice({
  name: 'moneyRequests',
  initialState: { items: [], status: 'idle', error: '' },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMoneyRequests.pending, (state) => {
        state.status = 'loading';
        state.error = '';
      })
      .addCase(fetchMoneyRequests.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = Array.isArray(action.payload) ? action.payload : (action.payload?.items || []);
      })
      .addCase(fetchMoneyRequests.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Unable to load money requests';
      });
  }
});

export const selectMoneyRequests = (s) => s.moneyRequests;

export default moneyRequestsSlice.reducer;

