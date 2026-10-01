/**
 * Base API Client using Axios with HttpOnly Cookie Security
 * - withCredentials: true ensures HttpOnly cookies are automatically sent & received.
 * - No tokens are stored in localStorage/sessionStorage.
 * - Silent refresh token rotation handles 401 expiration seamlessly.
 */

import axios from 'axios';
import { APP_CONFIG } from '../utils/constants';

export const api = axios.create({
  baseURL: APP_CONFIG.API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: true, // Crucial for sending/receiving HttpOnly cookies cross-origin
  timeout: 15000,
});

// Refresh token concurrency management
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

/**
 * Response Interceptor
 * 1. Automatically unwraps data payload.
 * 2. On 401 Unauthorized, transparently rotates/refreshes the access token via HttpOnly cookies.
 */
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const responseData = error.response?.data;
    const requestUrl = originalRequest?.url || '';

    // Ignore 401s on auth endpoints (login, refresh, logout) to avoid infinite loops
    const isAuthEndpoint =
      requestUrl.includes('/auth/login') ||
      requestUrl.includes('/auth/refresh') ||
      requestUrl.includes('/auth/logout');

    if (status === 401 && !isAuthEndpoint && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue pending requests while refresh is in-flight
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => api(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Trigger backend token rotation using the HttpOnly refreshToken cookie
        await api.post('/auth/refresh');
        processQueue(null);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        window.dispatchEvent(new Event('auth:unauthorized'));
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Extract human-friendly error message from backend
    let message = responseData?.error?.message || responseData?.message;

    // Handle backend validation details array if present (e.g. Zod)
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

    console.warn(`[ApiClient] Request to ${requestUrl} failed:`, message);

    return Promise.reject(customError);
  }
);

export default api;
