// store/slices/dashboardSlice.js
// ─────────────────────────────────────────────────────────────
// Dashboard state — كل البيانات جاية من farmStats في farmSlice
// عبر GET /api/farms/:id/stats
// ─────────────────────────────────────────────────────────────

import { createSlice } from '@reduxjs/toolkit'

const STATS_TEMPLATE = [
  { id: 'total',        label: 'إجمالي الحيوانات',    value: '٠', rawValue: 0, icon: 'paw',     color: 'green' },
  { id: 'sick',         label: 'الحيوانات المريضة',   value: '٠', rawValue: 0, icon: 'medical', color: 'rose'  },
  { id: 'vaccinations', label: 'التطعيمات القادمة',   value: '٠', rawValue: 0, icon: 'syringe', color: 'blue', badge: 'الـ ٧ أيام القادمة' },
  { id: 'emergencies',  label: 'حالات الطوارئ',       value: '٠', rawValue: 0, icon: 'alert',   color: 'red',  urgent: true },
]

const initialState = {
  stats:              STATS_TEMPLATE,
  animalDistribution: [],
  weeklyTrends:       [],
  aiRecommendations:  [],
  recentActivities:   [],
  trendPeriod:        '7days',
  loading:            false,
  error:              null,
}

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    setTrendPeriod(state, action) {
      state.trendPeriod = action.payload
    },
    setLoading(state, action) {
      state.loading = action.payload
    },
    setError(state, action) {
      state.error = action.payload
    },
  },
})

export const { setTrendPeriod, setLoading, setError } = dashboardSlice.actions
export default dashboardSlice.reducer
