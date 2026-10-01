/**
 * Authentication Service for Merchant Portal (HttpOnly Cookie Mode)
 * - Zero tokens stored in localStorage or sessionStorage.
 * - Browser manages access and refresh tokens via secure HttpOnly cookies.
 */

import { api } from './api';
import { storage } from '../utils/helpers';
import { STORAGE_KEYS } from '../utils/constants';

export const authService = {
  /**
   * Log in merchant with credentials
   * Calls: POST /auth/login
   * Cookies: Backend sets HttpOnly accessToken & refreshToken
   * 
   * @param {{ email: string, password: string }} credentials
   * @returns {Promise<{ user: object }>}
   */
  async login({ email, password }) {
    const payload = {
      email: email?.trim(),
      password,
    };

    const response = await api.post('/auth/login', payload);
    const rawUser = response?.data?.user || response?.user;

    if (!rawUser) {
      throw new Error(response?.message || 'Login failed. User profile missing in server response.');
    }

    // Role authorization check
    if (rawUser.role && rawUser.role !== 'MERCHANT' && rawUser.role !== 'ADMIN') {
      throw new Error('Access denied. This portal is restricted to Merchant accounts.');
    }

    const user = {
      ...rawUser,
      name:
        rawUser.name ||
        (rawUser.firstName ? `${rawUser.firstName} ${rawUser.lastName || ''}`.trim() : rawUser.email),
      storeName:
        rawUser.storeName ||
        (rawUser.firstName ? `${rawUser.firstName} ${rawUser.lastName || ''}`.trim() : 'My Store'),
    };

    // Cache non-sensitive user profile for UI responsiveness
    storage.set(STORAGE_KEYS.AUTH_USER, user);

    return { user };
  },

  /**
   * Fetch current authenticated session profile
   * Calls: GET /auth/me (authenticates via HttpOnly accessToken cookie)
   */
  async getProfile() {
    const response = await api.get('/auth/me');
    const rawUser = response?.data?.user || response?.user;

    if (!rawUser) {
      throw new Error('Failed to retrieve user profile.');
    }

    const user = {
      ...rawUser,
      name:
        rawUser.name ||
        (rawUser.firstName ? `${rawUser.firstName} ${rawUser.lastName || ''}`.trim() : rawUser.email),
      storeName:
        rawUser.storeName ||
        (rawUser.firstName ? `${rawUser.firstName} ${rawUser.lastName || ''}`.trim() : 'My Store'),
    };

    storage.set(STORAGE_KEYS.AUTH_USER, user);
    return user;
  },

  /**
   * Rotate access & refresh tokens
   * Calls: POST /auth/refresh (authenticates via HttpOnly refreshToken cookie)
   */
  async refresh() {
    return api.post('/auth/refresh');
  },

  /**
   * Log out and clear session
   * Calls: POST /auth/logout so server instructs browser to clear HttpOnly cookies
   */
  async logout() {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.warn('[authService] Server logout notification failed:', err.message);
    } finally {
      storage.clearAuth();
    }
  },

  getCachedUser() {
    return storage.get(STORAGE_KEYS.AUTH_USER, null);
  },
};

export default authService;
