import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { authApi } from '../services/authApi';

const isTokenExpired = (token) => {
  if (!token) return true;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp ? payload.exp * 1000 <= Date.now() : false;
  } catch {
    return true;
  }
};

const getPersistedAuth = () => {
  try {
    const persistedAuth = localStorage.getItem('securepay_auth');
    if (!persistedAuth) return null;

    const parsed = JSON.parse(persistedAuth);
    if (isTokenExpired(parsed?.accessToken)) {
      localStorage.removeItem('securepay_auth');
      return null;
    }

    return parsed;
  } catch {
    localStorage.removeItem('securepay_auth');
    return null;
  }
};

const persisted = getPersistedAuth();
const initialState = {
  user: persisted ? persisted.user : null,
  accessToken: persisted ? persisted.accessToken : null,
  status: 'idle',
  error: null,
  isAuthenticated: Boolean(persisted)
};

const persistAuth = (payload) => {
  localStorage.setItem('securepay_auth', JSON.stringify(payload));
};

export const loginUser = createAsyncThunk('auth/loginUser', async (payload, { rejectWithValue }) => {
  try {
    return await authApi.login(payload);
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Unable to login');
  }
});

export const registerUser = createAsyncThunk('auth/registerUser', async (payload, { rejectWithValue }) => {
  try {
    return await authApi.register(payload);
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Unable to register');
  }
});

export const sendOtp = createAsyncThunk('auth/sendOtp', async (payload, { rejectWithValue }) => {
  try {
    return await authApi.sendOtp(payload);
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Unable to send OTP');
  }
});

export const verifyEmail = createAsyncThunk('auth/verifyEmail', async (payload, { rejectWithValue }) => {
  try {
    return await authApi.verifyEmail(payload);
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Unable to verify email');
  }
});

export const verifyOtp = createAsyncThunk('auth/verifyOtp', async (payload, { rejectWithValue }) => {
  try {
    return await authApi.verifyOtp(payload);
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Unable to verify OTP');
  }
});

export const resendOtp = createAsyncThunk('auth/resendOtp', async (payload, { rejectWithValue }) => {
  try {
    return await authApi.resendOtp(payload);
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Unable to resend OTP');
  }
});

export const requestPasswordReset = createAsyncThunk('auth/requestPasswordReset', async (payload, { rejectWithValue }) => {
  try {
    return await authApi.forgotPassword(payload);
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Unable to send reset link');
  }
});

export const resetPassword = createAsyncThunk('auth/resetPassword', async (payload, { rejectWithValue }) => {
  try {
    return await authApi.resetPassword(payload);
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Unable to reset password');
  }
});

export const logoutUser = createAsyncThunk('auth/logoutUser', async (_, { rejectWithValue }) => {
  try {
    return await authApi.logout();
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Unable to logout');
  }
});

export const refreshSession = createAsyncThunk('auth/refreshSession', async (payload, { rejectWithValue }) => {
  try {
    return await authApi.refreshToken(payload);
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Unable to refresh session');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    restoreSession(state) {
      const parsed = getPersistedAuth();
      if (parsed) {
        state.user = parsed.user;
        state.accessToken = parsed.accessToken;
        state.isAuthenticated = true;
      } else {
        state.user = null;
        state.accessToken = null;
        state.isAuthenticated = false;
      }
    },
    setCredentials(state, action) {
      const { user, accessToken } = action.payload;
      state.user = user;
      state.accessToken = accessToken;
      state.isAuthenticated = true;
      persistAuth({ user, accessToken });
    },
    clearAuth(state) {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.status = 'idle';
      state.error = null;
      localStorage.removeItem('securepay_auth');
    },
    updateUser(state, action) {
      state.user = { ...state.user, ...action.payload };
      const persistedAuth = localStorage.getItem('securepay_auth');
      if (persistedAuth) {
        const parsed = JSON.parse(persistedAuth);
        parsed.user = state.user;
        localStorage.setItem('securepay_auth', JSON.stringify(parsed));
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload.data.user;
        state.accessToken = action.payload.data.accessToken;
        state.isAuthenticated = true;
        persistAuth({ user: action.payload.data.user, accessToken: action.payload.data.accessToken });
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(registerUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.status = 'succeeded';
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.isAuthenticated = false;
        localStorage.removeItem('securepay_auth');
      })
      .addCase(requestPasswordReset.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(refreshSession.fulfilled, (state, action) => {
        state.accessToken = action.payload.data.accessToken;
        if (state.user) {
          persistAuth({ user: state.user, accessToken: action.payload.data.accessToken });
        }
      })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.user = action.payload.data.user;
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(resendOtp.rejected, (state, action) => {
        state.error = action.payload;
      });
  }
});

export const { restoreSession, setCredentials, clearAuth, updateUser } = authSlice.actions;
export default authSlice.reducer;
