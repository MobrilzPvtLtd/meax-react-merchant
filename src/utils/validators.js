/**
 * Validation Utility Functions
 */

export const isRequired = (value) => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
};

export const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

export const isValidPassword = (password, minLength = 6) => {
  if (!password || typeof password !== 'string') return false;
  return password.length >= minLength;
};

export const validateLoginForm = (values = {}) => {
  const errors = {};

  if (!isRequired(values.email)) {
    errors.email = 'Email address is required.';
  } else if (!isValidEmail(values.email)) {
    errors.email = 'Please enter a valid email address.';
  }

  if (!isRequired(values.password)) {
    errors.password = 'Password is required.';
  } else if (!isValidPassword(values.password, 6)) {
    errors.password = 'Password must be at least 6 characters.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
