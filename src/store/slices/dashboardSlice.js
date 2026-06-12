// store/slices/dashboardSlice.js
// ─────────────────────────────────────────────────────────────
// لما يجي الـ Backend، بدّل الـ initialState بـ async thunk
// يجيب البيانات من services/dashboardService.js
// ─────────────────────────────────────────────────────────────

import { createSlice } from "@reduxjs/toolkit";
import {
  DASHBOARD_STATS,
  ANIMAL_DISTRIBUTION,
  WEEKLY_HEALTH_TRENDS,
  AI_RECOMMENDATIONS,
  RECENT_ACTIVITIES,
} from "../../constants/mockData";

const initialState = {
  stats: DASHBOARD_STATS,
  animalDistribution: ANIMAL_DISTRIBUTION,
  weeklyTrends: WEEKLY_HEALTH_TRENDS,
  aiRecommendations: AI_RECOMMENDATIONS,
  recentActivities: RECENT_ACTIVITIES,
  trendPeriod: "7days", // "7days" | "30days" | "90days"
  loading: false,
  error: null,
};

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    setTrendPeriod(state, action) {
      state.trendPeriod = action.payload;
      // TODO: dispatch fetch thunk هنا لما يجي الـ API
    },
    // placeholder للـ API integration لاحقاً
    setStats(state, action) {
      state.stats = action.payload;
    },
    setWeeklyTrends(state, action) {
      state.weeklyTrends = action.payload;
    },
    setLoading(state, action) {
      state.loading = action.payload;
    },
    setError(state, action) {
      state.error = action.payload;
    },
  },
});

export const { setTrendPeriod, setStats, setWeeklyTrends, setLoading, setError } =
  dashboardSlice.actions;

export default dashboardSlice.reducer;
