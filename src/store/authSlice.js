/**
 * Auth Slice (Redux Toolkit) for Merchant Portal
 * Managed via HttpOnly Secure Cookies - Zero token state in Redux
 */

import { createSlice } from '@reduxjs/toolkit';
import { storage } from '../utils/helpers';
import { STORAGE_KEYS } from '../utils/constants';

const cachedUser = storage.get(STORAGE_KEYS.AUTH_USER, null);

const initialState = {
  user: cachedUser,
  isAuthenticated: Boolean(cachedUser),
  isInitialized: false, // Indicates whether initial /auth/me check has completed
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setInitialized: (state, action) => {
      state.isInitialized = action.payload;
    },
    loginSuccess: (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.isInitialized = true;
      state.user = action.payload.user;
      state.error = null;
    },
    loginFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.isInitialized = true;
      state.loading = false;
      state.error = null;
    },
    updateUserProfile: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      storage.set(STORAGE_KEYS.AUTH_USER, state.user);
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setLoading,
  setInitialized,
  loginSuccess,
  loginFailure,
  logout,
  updateUserProfile,
  clearError,
} = authSlice.actions;

export const selectAuth = (state) => state.auth;
export const selectCurrentUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectIsAuthInitialized = (state) => state.auth.isInitialized;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError = (state) => state.auth.error;

export default authSlice.reducer;
