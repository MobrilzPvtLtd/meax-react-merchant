/**
 * General Purpose Helper Utilities
 */

import { STORAGE_KEYS } from './constants';

/**
 * Safe local storage wrapper with JSON serialization
 */
export const storage = {
  get: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (err) {
      console.error(`Error reading key "${key}" from localStorage:`, err);
      return defaultValue;
    }
  },

  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.error(`Error writing key "${key}" to localStorage:`, err);
    }
  },

  remove: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (err) {
      console.error(`Error removing key "${key}" from localStorage:`, err);
    }
  },

  clearAuth: () => {
    storage.remove(STORAGE_KEYS.AUTH_USER);
  },
};

/**
 * Format date into human-readable string
 * @param {string | Date} date
 * @returns {string} e.g. "Sep 28, 2026"
 */
export const formatDate = (date) => {
  if (!date) return '-';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

/**
 * Format numeric value to currency
 * @param {number} amount
 * @param {string} currency
 */
export const formatCurrency = (amount, currency = 'USD') => {
  if (typeof amount !== 'number') return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};

/**
 * Extract initials from full name
 * @param {string} name
 * @returns {string} e.g. "Dana White" -> "DW"
 */
export const getInitials = (name = '') => {
  if (!name) return 'M';
  return name
    .trim()
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join('');
};

/**
 * Truncate long strings with ellipsis
 */
export const truncateText = (text, maxLength = 30) => {
  if (!text || text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
};
