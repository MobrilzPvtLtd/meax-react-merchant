/**
 * Merchant Portal Constants
 */

export const APP_CONFIG = {
  NAME: import.meta.env.VITE_APP_NAME || 'Meax Merchant Portal',
  ENV: import.meta.env.VITE_APP_ENV || 'development',
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1',
};

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  DASHBOARD: '/dashboard',
  ORDERS: '/orders',
  MENU: '/menu',
  SETTINGS: '/settings',
  ACCOUNT: '/account',
  NOT_FOUND: '*',
};

export const STORAGE_KEYS = {
  AUTH_USER: 'meax_merchant_user',
  THEME_MODE: 'meax_merchant_theme_mode',
};

export const USER_ROLES = {
  MERCHANT: 'MERCHANT',
  ADMIN: 'ADMIN',
};

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
};
