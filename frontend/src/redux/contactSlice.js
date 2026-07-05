import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { sendContactMessage } from '../services/contactService';

// Async Thunk
export const submitContactMessage = createAsyncThunk(
  'contact/submitMessage',
  async (messageData, { rejectWithValue }) => {
    try {
      const data = await sendContactMessage(messageData);
      return data; // Expected { success: true, message: '...' }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'حدث خطأ في الاتصال بالخادم'
      );
    }
  }
);

const initialState = {
  loading: false,
  error: null,
  success: false,
};

const contactSlice = createSlice({
  name: 'contact',
  initialState,
  reducers: {
    resetContactState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitContactMessage.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(submitContactMessage.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(submitContactMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetContactState } = contactSlice.actions;
export default contactSlice.reducer;
