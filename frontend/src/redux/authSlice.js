import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '../services/authService';
import { userService } from '../services/userService';

// Async Thunks
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials, { rejectWithValue }) => {
    try {
      const data = await authService.login(credentials);
      return data;
    } catch (error) {
      const responseData = error.response?.data;
      const status = error.response?.status;

      // If email is not verified (status 403) — reject with the full object
      // so Login.jsx can detect email_verified: false and show the resend button
      if (
        status === 403 &&
        (responseData?.email_verified === false ||
          responseData?.message?.includes('تفعيل') ||
          responseData?.message?.includes('verify') ||
          responseData?.message?.includes('مفعل'))
      ) {
        return rejectWithValue({
          email_verified: false,
          message: responseData?.message || 'بريدك الإلكتروني غير مفعل',
        });
      }

      if (responseData?.errors && Array.isArray(responseData.errors)) {
        const firstError = responseData.errors[0];
        return rejectWithValue(firstError?.message || 'بيانات غير صحيحة');
      }
      return rejectWithValue(responseData?.message || 'بيانات الدخول غير صحيحة');
    }
  }
);

export const loginWithGoogle = createAsyncThunk(
  'auth/loginWithGoogle',
  async (idToken, { rejectWithValue }) => {
    try {
      const data = await authService.googleLogin(idToken);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Google Login failed');
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (userData, { rejectWithValue }) => {
    try {
      const data = await authService.register(userData);
      return data;
    } catch (error) {
      // Network error (backend not running)
      if (!error.response) {
        return rejectWithValue('لا يمكن الاتصال بالخادم — تأكد أن الباك إند شغال على localhost:5000');
      }
      const responseData = error.response.data;
      const status = error.response.status;
      // Validation errors (422)
      if (status === 422 && responseData?.errors && Array.isArray(responseData.errors)) {
        const messages = responseData.errors.map(e => e.message).join(' | ');
        return rejectWithValue(messages);
      }
      // Email already exists (409)
      if (status === 409) {
        return rejectWithValue('البريد الإلكتروني مستخدم بالفعل');
      }
      return rejectWithValue(responseData?.message || `خطأ من السيرفر (${status})`);
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout();
      return true;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Logout failed');
    }
  }
);

export const fetchProfile = createAsyncThunk(
  'auth/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const data = await userService.getProfile();
      // Expected data: { success: true, user: { ... } }
      return data.user;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch profile');
    }
  }
);

// ─── استعادة بيانات الجلسة من localStorage عند بدء التشغيل ───
const savedToken = localStorage.getItem('accessToken');
const savedUser = (() => {
  try { return JSON.parse(localStorage.getItem('authUser')); }
  catch { return null; }
})();

const initialState = {
  user: savedUser || null,
  accessToken: savedToken || null,
  isAuthenticated: !!(savedToken && savedUser),
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Basic synchronous actions
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      localStorage.removeItem('accessToken');
      localStorage.removeItem('authUser');
    },
    updateToken: (state, action) => {
      state.accessToken = action.payload;
      if (action.payload) {
        localStorage.setItem('accessToken', action.payload);
      }
    },
    setCredentials: (state, action) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.access_token;
      state.isAuthenticated = true;
      localStorage.setItem('accessToken', action.payload.access_token);
      localStorage.setItem('authUser', JSON.stringify(action.payload.user));
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    // Login
    builder.addCase(loginUser.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(loginUser.fulfilled, (state, action) => {
      state.loading = false;
      state.user = action.payload.user;
      state.accessToken = action.payload.access_token;
      state.isAuthenticated = true;
      localStorage.setItem('accessToken', action.payload.access_token);
      localStorage.setItem('authUser', JSON.stringify(action.payload.user));
    });
    builder.addCase(loginUser.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Google Login
    builder.addCase(loginWithGoogle.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(loginWithGoogle.fulfilled, (state, action) => {
      state.loading = false;
      state.user = action.payload.user;
      state.accessToken = action.payload.access_token;
      state.isAuthenticated = true;
      localStorage.setItem('accessToken', action.payload.access_token);
      localStorage.setItem('authUser', JSON.stringify(action.payload.user));
    });
    builder.addCase(loginWithGoogle.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Register (Doesn't log in automatically based on Postman response)
    builder.addCase(registerUser.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(registerUser.fulfilled, (state) => {
      state.loading = false;
    });
    builder.addCase(registerUser.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Logout
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      localStorage.removeItem('accessToken');
      localStorage.removeItem('authUser');
    });

    // Fetch Profile
    builder.addCase(fetchProfile.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchProfile.fulfilled, (state, action) => {
      state.loading = false;
      state.user = action.payload;
      state.isAuthenticated = true;
    });
    builder.addCase(fetchProfile.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });
  },
});

export const { logout, updateToken, setCredentials, clearError } = authSlice.actions;

export default authSlice.reducer;
