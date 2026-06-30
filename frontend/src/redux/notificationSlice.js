import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';
import { logout, logoutUser } from './authSlice';

// ── Async Thunks ──────────────────────────────────────────────────────────────

export const fetchNotifications = createAsyncThunk(
  'notifications/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/api/notifications');
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'فشل جلب الإشعارات');
    }
  }
);

export const markAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (id, { rejectWithValue }) => {
    try {
      await api.put(`/api/notifications/${id}/read`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'فشل التحديث');
    }
  }
);

export const markAllAsRead = createAsyncThunk(
  'notifications/markAllAsRead',
  async (_, { rejectWithValue }) => {
    try {
      await api.put('/api/notifications/read-all');
      return true;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'فشل التحديث');
    }
  }
);

export const deleteNotification = createAsyncThunk(
  'notifications/delete',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/api/notifications/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'فشل الحذف');
    }
  }
);

// ── Slice ─────────────────────────────────────────────────────────────────────

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: {
    items:        [],
    unread_count: 0,
    loading:      false,
    error:        null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetch
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error   = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading      = false;
        state.items        = action.payload.data        || [];
        state.unread_count = action.payload.unread_count ?? 0;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload;
      })

      // mark one as read
      .addCase(markAsRead.fulfilled, (state, action) => {
        const id = action.payload;
        const notif = state.items.find((n) => n._id === id);
        if (notif && !notif.is_read) {
          notif.is_read = true;
          state.unread_count = Math.max(0, state.unread_count - 1);
        }
      })

      // mark all as read
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.items        = state.items.map((n) => ({ ...n, is_read: true }));
        state.unread_count = 0;
      })

     // delete
        .addCase(deleteNotification.fulfilled, (state, action) => {
        const id = action.payload;
        const notif = state.items.find((n) => n._id === id);
        if (notif && !notif.is_read) {
            state.unread_count = Math.max(0, state.unread_count - 1);
        }
        state.items = state.items.filter((n) => n._id !== id);
        })

        // مسح الإشعارات عند الـ logout
        .addCase(logout, (state) => {
        state.items        = [];
        state.unread_count = 0;
        state.loading      = false;
        state.error        = null;
        })
        .addCase(logoutUser.fulfilled, (state) => {
        state.items        = [];
        state.unread_count = 0;
        state.loading      = false;
        state.error        = null;
        })
  },
});

export default notificationSlice.reducer;