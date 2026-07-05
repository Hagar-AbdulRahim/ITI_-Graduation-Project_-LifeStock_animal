import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { reviewService } from '../services/reviewService';

// ── Async Thunks ──────────────────────────────────────────────────────────────

export const fetchAllReviews = createAsyncThunk(
  'reviews/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const result = await reviewService.getAllReviews();
      return result.data; // { success, count, data: [...reviews] }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'فشل في تحميل المراجعات');
    }
  }
);

export const createReview = createAsyncThunk(
  'reviews/create',
  async (reviewData, { rejectWithValue }) => {
    try {
      const result = await reviewService.createReview(reviewData);
      return result.data; // { success, data: review }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'فشل في إضافة المراجعة');
    }
  }
);

export const deleteReview = createAsyncThunk(
  'reviews/delete',
  async (id, { rejectWithValue }) => {
    try {
      await reviewService.deleteReview(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'فشل في حذف المراجعة');
    }
  }
);

// ── Initial State ─────────────────────────────────────────────────────────────

const initialState = {
  reviews: [],
  loading: false,
  error: null,
  createLoading: false,
  createError: null,
  deleteLoading: false,
};

// ── Slice ─────────────────────────────────────────────────────────────────────

const reviewSlice = createSlice({
  name: 'reviews',
  initialState,
  reducers: {
    clearReviewErrors: (state) => {
      state.error = null;
      state.createError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch All Reviews
      .addCase(fetchAllReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.reviews = action.payload || [];
      })
      .addCase(fetchAllReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create Review
      .addCase(createReview.pending, (state) => {
        state.createLoading = true;
        state.createError = null;
      })
      .addCase(createReview.fulfilled, (state, action) => {
        state.createLoading = false;
        state.reviews.unshift(action.payload);
      })
      .addCase(createReview.rejected, (state, action) => {
        state.createLoading = false;
        state.createError = action.payload;
      })

      // Delete Review
      .addCase(deleteReview.pending, (state) => {
        state.deleteLoading = true;
      })
      .addCase(deleteReview.fulfilled, (state, action) => {
        state.deleteLoading = false;
        state.reviews = state.reviews.filter((r) => r._id !== action.payload);
      })
      .addCase(deleteReview.rejected, (state, action) => {
        state.deleteLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearReviewErrors } = reviewSlice.actions;
export default reviewSlice.reducer;
