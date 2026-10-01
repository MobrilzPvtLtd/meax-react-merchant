/**
 * Base API Client using Axios
 * Automatically injects authentication tokens, normalizes base URLs,
 * handles request timeouts, and provides unified error extraction.
 */

import axios from 'axios';
import { APP_CONFIG, STORAGE_KEYS } from '../utils/constants';
import { storage } from '../utils/helpers';

export const api = axios.create({
  baseURL: APP_CONFIG.API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 15000,
});

/**
 * Request Interceptor
 * Injects Bearer token from localStorage for all outgoing requests
 */
api.interceptors.request.use(
  (config) => {
    const token = storage.get(STORAGE_KEYS.AUTH_TOKEN);
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response Interceptor
 * Unwraps data payload and formats error messages cleanly
 */
api.interceptors.response.use(
  (response) => {
    // Axios puts the server's body in response.data
    return response.data;
  },
  (error) => {
    const status = error.response?.status;
    const responseData = error.response?.data;

    // Handle token expiry / unauthorized for authenticated requests
    if (status === 401 && !error.config?.url?.includes('/auth/login')) {
      storage.clearAuth();
      window.dispatchEvent(new Event('auth:unauthorized'));
    }

    // Extract human-friendly error message from backend structure
    let message = responseData?.error?.message || responseData?.message;

    // Handle validation details array if present (e.g. Zod / backend validation)
    if (
      responseData?.error?.details &&
      Array.isArray(responseData.error.details) &&
      responseData.error.details.length > 0
    ) {
      message = responseData.error.details
        .map((d) => d.message || d.msg || JSON.stringify(d))
        .join('. ');
    }

    if (!message) {
      message =
        error.code === 'ECONNABORTED'
          ? 'Request timed out. Please check your network connection.'
          : error.message || 'An unexpected error occurred.';
    }

    const customError = new Error(message);
    customError.status = status;
    customError.data = responseData;
    customError.code = responseData?.error?.code || error.code;

    console.warn(`[ApiClient] Request to ${error.config?.url || 'endpoint'} failed:`, message);

    return Promise.reject(customError);
  }
);

export default api;
