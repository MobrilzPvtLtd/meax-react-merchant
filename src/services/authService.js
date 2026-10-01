/**
 * Authentication Service for Merchant Portal
 * Connects to MEAX backend auth API (${VITE_API_BASE_URL}/auth/login)
 */

import { api } from './api';
import { storage } from '../utils/helpers';
import { STORAGE_KEYS } from '../utils/constants';

export const authService = {
  /**
   * Log in merchant with credentials
   * Calls: POST ${VITE_API_BASE_URL}/auth/login
   * Body: { "email": "...", "password": "..." }
   * 
   * @param {{ email: string, password: string }} credentials
   * @returns {Promise<{ token: string, user: object }>}
   */
  async login({ email, password }) {
    const payload = {
      email: email?.trim(),
      password,
    };

    const response = await api.post('/auth/login', payload);

    // Support standard backend response: response.data.tokens.accessToken
    // and fallback shapes: response.tokens.accessToken, response.data.token, response.token
    const token =
      response?.data?.tokens?.accessToken ||
      response?.tokens?.accessToken ||
      response?.data?.token ||
      response?.token;

    const refreshToken =
      response?.data?.tokens?.refreshToken ||
      response?.tokens?.refreshToken ||
      response?.refreshToken;

    const rawUser = response?.data?.user || response?.user;

    if (!token || !rawUser) {
      throw new Error(response?.message || 'Login failed. Invalid response received from server.');
    }

    // Ensure role authorization if specified
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

    // Persist session tokens & user profile
    storage.set(STORAGE_KEYS.AUTH_TOKEN, token);
    if (refreshToken) {
      storage.set('meax_merchant_refresh_token', refreshToken);
    }
    storage.set(STORAGE_KEYS.AUTH_USER, user);

    return { token, user };
  },

  /**
   * Log out and clear stored session
   */
  async logout() {
    storage.clearAuth();
    storage.remove('meax_merchant_refresh_token');
  },

  getCurrentUser() {
    return storage.get(STORAGE_KEYS.AUTH_USER, null);
  },

  getStoredToken() {
    return storage.get(STORAGE_KEYS.AUTH_TOKEN, null);
  },
};

export default authService;
