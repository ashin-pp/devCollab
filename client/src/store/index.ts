import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import pollReducer from './slices/pollSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    polls: pollReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
