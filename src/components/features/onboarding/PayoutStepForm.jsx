import React, { useState } from 'react';
import { Shield, Check, AlertCircle } from 'lucide-react';
import merchantOnboardingService from '../../../services/merchantOnboardingService';

/**
 * Step 4: Stripe Payout Setup Flow
 * Matches user screenshots:
 * SubStep 1: "Get paid through Stripe" intro
 * SubStep 2: "Hosted by Stripe" - Form with Legal business name, EIN, Routing, Account number
 */
export const PayoutStepForm = ({
  initialBusinessName = '',
  businessEmail = '',
  onBack,
  onStepComplete,
}) => {
  // 'INTRO' (Image 1) or 'FORM' (Image 2)
  const [subStep, setSubStep] = useState('INTRO');

  const [formData, setFormData] = useState({
    legal_business_name: initialBusinessName ? `${initialBusinessName} LLC` : '',
    ein: '12-3456789',
    routing_number: '110000000',
    account_number: '000123456789',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  // Auto-format EIN as XX-XXXXXXX
  const formatEin = (value) => {
    const clean = value.replace(/\D/g, '').slice(0, 9);
    if (clean.length <= 2) return clean;
    return `${clean.slice(0, 2)}-${clean.slice(2)}`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'ein') {
      const formatted = formatEin(value);
      setFormData((prev) => ({ ...prev, [name]: formatted }));
    } else if (name === 'routing_number') {
      const digits = value.replace(/\D/g, '').slice(0, 9);
      setFormData((prev) => ({ ...prev, [name]: digits }));
    } else if (name === 'account_number') {
      const digits = value.replace(/\D/g, '').slice(0, 17);
      setFormData((prev) => ({ ...prev, [name]: digits }));
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

    if (!formData.legal_business_name.trim()) {
      errs.legal_business_name = 'Legal business name is required.';
    } else if (formData.legal_business_name.trim().length < 2) {
      errs.legal_business_name = 'Must be at least 2 characters.';
    }

    const cleanEin = formData.ein.replace(/\D/g, '');
    if (!cleanEin) {
      errs.ein = 'EIN is required.';
    } else if (cleanEin.length !== 9) {
      errs.ein = 'EIN must be 9 digits (XX-XXXXXXX).';
    }

    if (!formData.routing_number) {
      errs.routing_number = 'Routing number is required.';
    } else if (formData.routing_number.length !== 9) {
      errs.routing_number = 'Must be 9 digits.';
    }

    if (!formData.account_number) {
      errs.account_number = 'Account number is required.';
    } else if (formData.account_number.length < 4 || formData.account_number.length > 17) {
      errs.account_number = 'Must be 4 to 17 digits.';
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
      const result = await merchantOnboardingService.setupPayout({
        legal_business_name: formData.legal_business_name.trim(),
        ein: formData.ein.trim(),
        routing_number: formData.routing_number.trim(),
        account_number: formData.account_number.trim(),
      });

      if (onStepComplete) {
        onStepComplete(result);
      }
    } catch (err) {
      const errorMsg =
        err.message || 'Failed to setup payout account. Please check your bank information.';
      setError(errorMsg);

      const fieldErrs = { ...(err.fieldErrors || {}) };
      if (err.details && Array.isArray(err.details)) {
        err.details.forEach((item) => {
          if (item.field) fieldErrs[item.field] = item.message;
        });
      }

      const lower = errorMsg.toLowerCase();
      if (!fieldErrs.routing_number && lower.includes('routing')) {
        fieldErrs.routing_number = errorMsg;
      }
      if (!fieldErrs.account_number && lower.includes('account number')) {
        fieldErrs.account_number = errorMsg;
      }
      if (!fieldErrs.ein && (lower.includes('ein') || lower.includes('tax id'))) {
        fieldErrs.ein = errorMsg;
      }

      if (Object.keys(fieldErrs).length > 0) {
        setValidationErrors(fieldErrs);
      }
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------------------
  // SCREEN 1: "Get paid through Stripe" Intro (Matches Image 1)
  // -------------------------------------------------------------
  if (subStep === 'INTRO') {
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
          Get paid through Stripe
        </h1>

        <p
          style={{
            fontSize: '0.925rem',
            color: '#4b5563',
            margin: '0 0 1.75rem 0',
            lineHeight: 1.5,
          }}
        >
          We send your sales, minus commission and Stripe fees, to your bank account on a set schedule.
        </p>

        {/* Feature Box with Checkmarks */}
        <div
          style={{
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            padding: '1.25rem 1.5rem',
            marginBottom: '1.75rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            background: '#ffffff',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Check size={18} color="#1f2937" strokeWidth={2.5} style={{ flexShrink: 0 }} />
            <span style={{ fontSize: '0.92rem', color: '#1f2937', fontWeight: 500 }}>
              Takes about 5 minutes
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Check size={18} color="#1f2937" strokeWidth={2.5} style={{ flexShrink: 0 }} />
            <span style={{ fontSize: '0.92rem', color: '#1f2937', fontWeight: 500 }}>
              Have your EIN and bank details ready
            </span>
          </div>
        </div>

        {/* Navigation Buttons Row */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            type="button"
            onClick={onBack}
            style={{
              flex: 1,
              background: '#ffffff',
              color: '#1f2937',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              padding: '12px 18px',
              fontSize: '0.95rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'background 0.15s ease',
            }}
          >
            Back
          </button>

          <button
            type="button"
            onClick={() => setSubStep('FORM')}
            style={{
              flex: 1,
              background: '#2b6d28',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 18px',
              fontSize: '0.95rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'background 0.15s ease',
            }}
          >
            Continue to Stripe
          </button>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // SCREEN 2: "Hosted by Stripe" Form (Matches Image 2)
  // -------------------------------------------------------------
  const displayBusinessName = initialBusinessName || 'Lone Star Pizza Co.';

  return (
    <div>
      {/* Pill Badge: Hosted by Stripe */}
      <div style={{ marginBottom: '1rem' }}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: '#eaf5ea',
            border: '1px solid #d2ebd0',
            borderRadius: '999px',
            padding: '4px 12px',
            fontSize: '0.78rem',
            fontWeight: 600,
            color: '#1b4313',
          }}
        >
          <Shield size={13} color="#2b6d28" />
          <span>Hosted by Stripe</span>
        </span>
      </div>

      <h1
        style={{
          fontSize: '1.75rem',
          fontWeight: 800,
          color: '#1a1a1a',
          margin: '0 0 0.5rem 0',
          letterSpacing: '-0.02em',
        }}
      >
        Set up payouts for {displayBusinessName}
      </h1>

      <p
        style={{
          fontSize: '0.9rem',
          color: '#4b5563',
          margin: '0 0 1.5rem 0',
          lineHeight: 1.5,
        }}
      >
        Stripe verifies your business and collects your bank account. MEAX never sees your full bank details.
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
            fontSize: '0.85rem',
            lineHeight: 1.4,
          }}
        >
          <AlertCircle size={18} style={{ color: '#dc2626', flexShrink: 0, marginTop: '2px' }} />
          <div>
            <div style={{ fontWeight: 600 }}>Stripe Setup Error</div>
            <div>{error}</div>
          </div>
        </div>
      )}

      <form noValidate onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Row 1: Legal business name & EIN */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          {/* Legal business name */}
          <div>
            <label
              htmlFor="legal_business_name"
              style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#1a1a1a', marginBottom: '6px' }}
            >
              Legal business name
            </label>
            <input
              id="legal_business_name"
              name="legal_business_name"
              type="text"
              value={formData.legal_business_name}
              onChange={handleChange}
              placeholder="Lone Star Pizza Company LLC"
              style={{
                width: '100%',
                padding: '11px 14px',
                borderRadius: '8px',
                border: `1px solid ${validationErrors.legal_business_name ? '#dc2626' : '#d1d5db'}`,
                fontSize: '0.925rem',
                color: '#1a1a1a',
                outline: 'none',
                boxSizing: 'border-box',
                background: '#fff',
              }}
            />
            {validationErrors.legal_business_name && (
              <span style={{ fontSize: '0.78rem', color: '#dc2626', marginTop: '4px', display: 'block' }}>
                {validationErrors.legal_business_name}
              </span>
            )}
          </div>

          {/* EIN */}
          <div>
            <label
              htmlFor="ein"
              style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#1a1a1a', marginBottom: '6px' }}
            >
              EIN
            </label>
            <input
              id="ein"
              name="ein"
              type="text"
              value={formData.ein}
              onChange={handleChange}
              placeholder="12-3456789"
              maxLength={10}
              style={{
                width: '100%',
                padding: '11px 14px',
                borderRadius: '8px',
                border: `1px solid ${validationErrors.ein ? '#dc2626' : '#d1d5db'}`,
                fontSize: '0.925rem',
                color: '#1a1a1a',
                outline: 'none',
                boxSizing: 'border-box',
                background: '#fff',
              }}
            />
            {validationErrors.ein && (
              <span style={{ fontSize: '0.78rem', color: '#dc2626', marginTop: '4px', display: 'block' }}>
                {validationErrors.ein}
              </span>
            )}
          </div>
        </div>

        {/* Row 2: Routing number & Account number */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          {/* Routing number */}
          <div>
            <label
              htmlFor="routing_number"
              style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#1a1a1a', marginBottom: '6px' }}
            >
              Routing number
            </label>
            <input
              id="routing_number"
              name="routing_number"
              type="text"
              value={formData.routing_number}
              onChange={handleChange}
              placeholder="110000000"
              maxLength={9}
              style={{
                width: '100%',
                padding: '11px 14px',
                borderRadius: '8px',
                border: `1px solid ${validationErrors.routing_number ? '#dc2626' : '#d1d5db'}`,
                fontSize: '0.925rem',
                color: '#1a1a1a',
                outline: 'none',
                boxSizing: 'border-box',
                background: '#fff',
              }}
            />
            {validationErrors.routing_number && (
              <span style={{ fontSize: '0.78rem', color: '#dc2626', marginTop: '4px', display: 'block' }}>
                {validationErrors.routing_number}
              </span>
            )}
          </div>

          {/* Account number */}
          <div>
            <label
              htmlFor="account_number"
              style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#1a1a1a', marginBottom: '6px' }}
            >
              Account number
            </label>
            <input
              id="account_number"
              name="account_number"
              type="text"
              value={formData.account_number}
              onChange={handleChange}
              placeholder="000123456789"
              maxLength={17}
              style={{
                width: '100%',
                padding: '11px 14px',
                borderRadius: '8px',
                border: `1px solid ${validationErrors.account_number ? '#dc2626' : '#d1d5db'}`,
                fontSize: '0.925rem',
                color: '#1a1a1a',
                outline: 'none',
                boxSizing: 'border-box',
                background: '#fff',
              }}
            />
            {validationErrors.account_number && (
              <span style={{ fontSize: '0.78rem', color: '#dc2626', marginTop: '4px', display: 'block' }}>
                {validationErrors.account_number}
              </span>
            )}
          </div>
        </div>

        {/* Buttons Row: Leave before finishing & Finish and return to MEAX */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '0.75rem' }}>
          <button
            type="button"
            onClick={() => setSubStep('INTRO')}
            disabled={loading}
            style={{
              flex: 1,
              background: '#ffffff',
              color: '#1f2937',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              padding: '13px 18px',
              fontSize: '0.95rem',
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.15s ease',
            }}
          >
            Leave before finishing
          </button>

          <button
            type="submit"
            disabled={loading}
            style={{
              flex: 1,
              background: '#2b6d28',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '13px 18px',
              fontSize: '0.95rem',
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
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
                <span>Connecting...</span>
              </>
            ) : (
              'Finish and return to MEAX'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PayoutStepForm;
