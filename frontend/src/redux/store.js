import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import animalReducer from './animalSlice';
import farmReducer from './farmSlice';
import dashboardReducer from './dashBoard/dashboardSlice';
import homeDashboardReducer from '../features/HomeDashboard/dashboardSlice';
import notificationReducer from './notificationSlice';
import reviewReducer from './reviewSlice';
import contactReducer from './contactSlice';

export const store = configureStore({
    reducer: {
        auth:          authReducer,
        animal:        animalReducer,
        farm:          farmReducer,
        dashboard:     dashboardReducer,
        homeDashboard: homeDashboardReducer,
        notifications: notificationReducer,
        reviews:       reviewReducer,
        contact:       contactReducer,
    },
});