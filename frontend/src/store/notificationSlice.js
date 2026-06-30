import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { notificationApi } from '../services/notificationApi';

export const fetchNotifications = createAsyncThunk('notification/fetchNotifications', async (_, { rejectWithValue }) => {
  try {
    return await notificationApi.getNotifications();
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Unable to load notifications');
  }
});

export const markNotificationRead = createAsyncThunk('notification/markNotificationRead', async (id, { rejectWithValue }) => {
  try {
    await notificationApi.markAsRead(id);
    return id;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Unable to mark notification read');
  }
});

export const markAllNotificationsRead = createAsyncThunk('notification/markAllNotificationsRead', async (_, { rejectWithValue }) => {
  try {
    return await notificationApi.markAllRead();
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Unable to mark notifications read');
  }
});

const notificationSlice = createSlice({
  name: 'notification',
  initialState: {
    items: [],
    status: 'idle',
    error: null
  },
  reducers: {
    addNotification(state, action) {
      state.items = [action.payload, ...state.items];
    },
    clearNotifications(state) {
      state.items = [];
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload.data.items;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        state.items = state.items.map((item) => (
          item._id === action.payload ? { ...item, isRead: true, status: 'READ' } : item
        ));
      })
      .addCase(markAllNotificationsRead.fulfilled, (state) => {
        state.items = state.items.map((item) => ({ ...item, isRead: true, status: 'READ' }));
      });
  }
});

export const { addNotification, clearNotifications } = notificationSlice.actions;
export default notificationSlice.reducer;
