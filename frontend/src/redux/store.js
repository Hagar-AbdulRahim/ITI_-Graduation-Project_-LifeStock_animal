import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import animalReducer from './animalSlice';
import farmReducer from './farmSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        animal: animalReducer,
        farm: farmReducer,
    },
});
