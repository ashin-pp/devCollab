import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { User, AuthState } from '../../types/auth.types';
import {
  clearAdminSession,
  clearUserSession,
  markAdminSession,
  markUserSession,
} from '../../utils/sessionHint';

const initialState: AuthState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; accessToken: string }>
    ) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.isAuthenticated = true;
      if (action.payload.user.role === 'admin') {
        markAdminSession();
      } else {
        markUserSession();
      }
    },
    logout: (state) => {
      if (state.user?.role === 'admin') {
        clearAdminSession();
      } else {
        clearUserSession();
      }
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
  },
});

export const { setCredentials, logout, updateUser } = authSlice.actions;
export default authSlice.reducer;
