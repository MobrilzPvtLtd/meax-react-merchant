import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle2, ChevronDown, Eye, EyeOff } from 'lucide-react';
import { ROUTES } from '../../../utils/constants';
import merchantOnboardingService from '../../../services/merchantOnboardingService';

/**
 * Step 1: Business Profile Form
 * Matches the MEAX Merchant Onboarding screen
 */
export const BusinessStepForm = ({ onStepComplete }) => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    business_name: '',
    store_category_type: 1, // 1 = Food, 2 = Grocery
    business_email: '',
    business_phone: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successData, setSuccessData] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  // Helper to format phone as user types (e.g. +1 (214) 555-0110)
  const formatPhoneNumber = (value) => {
    if (!value) return value;
    const clean = value.replace(/[^\d]/g, '');
    if (clean.length === 0) return '';
    if (clean.length <= 1) return `+${clean}`;
    if (clean.length <= 4) return `+1 (${clean.slice(1)}`;
    if (clean.length <= 7) return `+1 (${clean.slice(1, 4)}) ${clean.slice(4)}`;
    return `+1 (${clean.slice(1, 4)}) ${clean.slice(4, 7)}-${clean.slice(7, 11)}`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'business_phone') {
      const formatted = formatPhoneNumber(value);
      setFormData((prev) => ({ ...prev, [name]: formatted }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (error) setError(null);
  };

  const validate = () => {
    const errs = {};
    if (!formData.business_name.trim()) {
      errs.business_name = 'Business name is required.';
    } else if (formData.business_name.trim().length < 2) {
      errs.business_name = 'Business name must be at least 2 characters.';
    }

    if (!formData.business_email.trim()) {
      errs.business_email = 'Business email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.business_email.trim())) {
      errs.business_email = 'Please enter a valid email address.';
    }

    const cleanPhone = formData.business_phone.replace(/[^\d]/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      errs.business_phone = 'Please provide a valid 10-digit phone number.';
    }

    if (!formData.password) {
      errs.password = 'Password is required.';
    } else if (formData.password.length < 8) {
      errs.password = 'Password must be at least 8 characters.';
    } else if (!/[A-Z]/.test(formData.password)) {
      errs.password = 'Password must contain at least one uppercase letter.';
    } else if (!/[a-z]/.test(formData.password)) {
      errs.password = 'Password must contain at least one lowercase letter.';
    } else if (!/\d/.test(formData.password)) {
      errs.password = 'Password must contain at least one number.';
    }

    setValidationErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setLoading(true);
    setError(null);
    setValidationErrors({});

    try {
      const result = await merchantOnboardingService.registerBusiness({
        business_name: formData.business_name,
        store_category_type: Number(formData.store_category_type),
        business_email: formData.business_email,
        business_phone: formData.business_phone,
        password: formData.password,
      });

      setSuccessData(result);
      if (onStepComplete) {
        onStepComplete(result);
      }
    } catch (err) {
      const errorMsg = err.message || 'Registration failed. Please check your information and try again.';
      setError(errorMsg);

      const fieldErrs = { ...(err.fieldErrors || {}) };

      if (err.details && Array.isArray(err.details)) {
        err.details.forEach((item) => {
          if (item.field) {
            fieldErrs[item.field] = item.message;
          }
        });
      }

      // If backend returned a specific error message matching phone or email
      const lower = errorMsg.toLowerCase();
      if (!fieldErrs.business_phone && (lower.includes('phone') || lower.includes('mobile'))) {
        fieldErrs.business_phone = errorMsg;
      }
      if (!fieldErrs.business_email && (lower.includes('email') || lower.includes('e-mail'))) {
        fieldErrs.business_email = errorMsg;
      }
      if (!fieldErrs.business_name && (lower.includes('business name') || lower.includes('store name'))) {
        fieldErrs.business_name = errorMsg;
      }
      if (!fieldErrs.password && lower.includes('password')) {
        fieldErrs.password = errorMsg;
      }

      if (Object.keys(fieldErrs).length > 0) {
        setValidationErrors(fieldErrs);
      }
    } finally {
      setLoading(false);
    }
  };

  // If Step 1 completed successfully, display confirmation state
  if (successData) {
    return (
      <div
        style={{
          background: '#f4fbf4',
          border: '1px solid #d2ebd0',
          borderRadius: '12px',
          padding: '2rem',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: '#e8f5e9',
            color: '#2e7d32',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem',
          }}
        >
          <CheckCircle2 size={28} />
        </div>

        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1b4313', marginBottom: '0.5rem' }}>
          Business Profile Registered!
        </h3>

        <p style={{ fontSize: '0.9rem', color: '#274d1c', marginBottom: '1.5rem', lineHeight: 1.5 }}>
          Your registration for <strong>{formData.business_name}</strong> is in progress.
          Registration ID: <code style={{ background: '#e0f2df', padding: '2px 6px', borderRadius: '4px' }}>{successData.registration_id}</code>
        </p>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button
            type="button"
            onClick={() => {
              if (typeof onStepComplete === 'function') {
                onStepComplete(successData);
              } else {
                navigate('/register?step=2');
              }
            }}
            style={{
              background: '#2e7d32',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 20px',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Continue to Store Location
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1
        style={{
          fontSize: '1.95rem',
          fontWeight: 800,
          color: '#1a1a1a',
          margin: '0 0 0.5rem 0',
          letterSpacing: '-0.02em',
        }}
      >
        Become a MEAX merchant
      </h1>

      <p
        style={{
          fontSize: '0.925rem',
          color: '#4b5563',
          margin: '0 0 1.5rem 0',
          lineHeight: 1.5,
        }}
      >
        Tell us about your business. Admin reviews every application before your store goes live.
      </p>

      {/* Global Error Banner */}
      {error && (
        <div
          role="alert"
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            padding: '12px 16px',
            marginBottom: '1.25rem',
            color: '#991b1b',
            fontSize: '0.875rem',
            lineHeight: 1.4,
          }}
        >
          <AlertCircle size={18} style={{ color: '#dc2626', flexShrink: 0, marginTop: '2px' }} />
          <div>
            <div style={{ fontWeight: 600 }}>Registration Failed</div>
            <div>{error}</div>
          </div>
        </div>
      )}

      <form noValidate onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Row 1: Business name & Store category */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          {/* Business name */}
          <div>
            <label
              htmlFor="business_name"
              style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#1a1a1a', marginBottom: '6px' }}
            >
              Business name
            </label>
            <input
              id="business_name"
              name="business_name"
              type="text"
              value={formData.business_name}
              onChange={handleChange}
              placeholder="Lone Star Pizza Co."
              style={{
                width: '100%',
                padding: '11px 14px',
                borderRadius: '8px',
                border: `1px solid ${validationErrors.business_name ? '#dc2626' : '#d1d5db'}`,
                fontSize: '0.9375rem',
                color: '#1a1a1a',
                outline: 'none',
                boxSizing: 'border-box',
                background: '#fff',
              }}
            />
            {validationErrors.business_name && (
              <span style={{ fontSize: '0.78rem', color: '#dc2626', marginTop: '4px', display: 'block' }}>
                {validationErrors.business_name}
              </span>
            )}
          </div>

          {/* Store category */}
          <div>
            <label
              htmlFor="store_category_type"
              style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#1a1a1a', marginBottom: '6px' }}
            >
              Store category
            </label>
            <div style={{ position: 'relative' }}>
              <select
                id="store_category_type"
                name="store_category_type"
                value={formData.store_category_type}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '11px 36px 11px 14px',
                  borderRadius: '8px',
                  border: '1px solid #d1d5db',
                  fontSize: '0.9375rem',
                  color: '#1a1a1a',
                  outline: 'none',
                  boxSizing: 'border-box',
                  background: '#fff',
                  appearance: 'none',
                  cursor: 'pointer',
                }}
              >
                <option value={1}>Food</option>
                <option value={2}>Grocery</option>
              </select>
              <ChevronDown
                size={16}
                color="#6b7280"
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  pointerEvents: 'none',
                }}
              />
            </div>
          </div>
        </div>

        {/* Row 2: Business email */}
        <div>
          <label
            htmlFor="business_email"
            style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#1a1a1a', marginBottom: '6px' }}
          >
            Business email
          </label>
          <input
            id="business_email"
            name="business_email"
            type="email"
            value={formData.business_email}
            onChange={handleChange}
            placeholder="dana@lonestarpizza.com"
            style={{
              width: '100%',
              padding: '11px 14px',
              borderRadius: '8px',
              border: `1px solid ${validationErrors.business_email ? '#dc2626' : '#d1d5db'}`,
              fontSize: '0.9375rem',
              color: '#1a1a1a',
              outline: 'none',
              boxSizing: 'border-box',
              background: '#fff',
            }}
          />
          <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '6px' }}>
            We use this for your login and account updates.
          </div>
          {validationErrors.business_email && (
            <span style={{ fontSize: '0.78rem', color: '#dc2626', marginTop: '4px', display: 'block' }}>
              {validationErrors.business_email}
            </span>
          )}
        </div>

        {/* Row 3: Business phone */}
        <div>
          <label
            htmlFor="business_phone"
            style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#1a1a1a', marginBottom: '6px' }}
          >
            Business phone
          </label>
          <input
            id="business_phone"
            name="business_phone"
            type="tel"
            value={formData.business_phone}
            onChange={handleChange}
            placeholder="+1 (214) 555-0110"
            style={{
              width: '100%',
              padding: '11px 14px',
              borderRadius: '8px',
              border: `1px solid ${validationErrors.business_phone ? '#dc2626' : '#d1d5db'}`,
              fontSize: '0.9375rem',
              color: '#1a1a1a',
              outline: 'none',
              boxSizing: 'border-box',
              background: '#fff',
            }}
          />
          <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '6px' }}>
            Food covers restaurants and cloud kitchens. Grocery covers supermarkets and convenience stores.
          </div>
          {validationErrors.business_phone && (
            <span style={{ fontSize: '0.78rem', color: '#dc2626', marginTop: '4px', display: 'block' }}>
              {validationErrors.business_phone}
            </span>
          )}
        </div>

        {/* Row 4: Account Password */}
        <div>
          <label
            htmlFor="password"
            style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#1a1a1a', marginBottom: '6px' }}
          >
            Password
          </label>
          <div style={{ position: 'relative' }}>
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a strong password"
              autoComplete="new-password"
              style={{
                width: '100%',
                padding: '11px 42px 11px 14px',
                borderRadius: '8px',
                border: `1px solid ${validationErrors.password ? '#dc2626' : '#d1d5db'}`,
                fontSize: '0.9375rem',
                color: '#1a1a1a',
                outline: 'none',
                boxSizing: 'border-box',
                background: '#fff',
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'transparent',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                color: '#6b7280',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '6px' }}>
            Must be at least 8 characters with uppercase, lowercase, and a number.
          </div>
          {validationErrors.password && (
            <span style={{ fontSize: '0.78rem', color: '#dc2626', marginTop: '4px', display: 'block' }}>
              {validationErrors.password}
            </span>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          style={{
            background: '#2e7d32',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            padding: '13px 20px',
            fontSize: '1rem',
            fontWeight: 700,
            cursor: loading ? 'not-allowed' : 'pointer',
            marginTop: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'background 0.15s ease',
          }}
        >
          {loading ? (
            <>
              <div
                style={{
                  width: '18px',
                  height: '18px',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: '#ffffff',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                }}
              />
              <span>Submitting application...</span>
            </>
          ) : (
            'Continue'
          )}
        </button>

        {/* Footer Navigation */}
        <div style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '0.5rem' }}>
          Already approved?{' '}
          <Link
            to={ROUTES.LOGIN}
            style={{ color: '#2e7d32', fontWeight: 600, textDecoration: 'underline' }}
          >
            Log in
          </Link>
          .{' '}
          <a
            href="/"
            style={{ color: '#2e7d32', fontWeight: 600, textDecoration: 'underline' }}
          >
            Back to website
          </a>
        </div>
      </form>
    </div>
  );
};

export default BusinessStepForm;
