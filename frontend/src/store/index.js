import { configureStore } from "@reduxjs/toolkit";
import dashboardReducer from "./slices/dashboardSlice";

export const store = configureStore({
  reducer: {
    dashboard: dashboardReducer,
    // animals: animalsReducer,       ← هتضيفهم لاحقاً
    // vaccinations: vaccinationsReducer,
    // diagnosis: diagnosisReducer,
  },
});

export default store;
