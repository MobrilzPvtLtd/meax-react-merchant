import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, AlertTriangle } from 'lucide-react';
import merchantOnboardingService from '../../../services/merchantOnboardingService';
import { ROUTES } from '../../../utils/constants';

/**
 * Step 5: "Application submitted" Screen
 * Matches Image 3 design:
 * - Centered green checkmark circle
 * - "Application submitted"
 * - "Admin is reviewing your business license. Your store can't receive orders until it's approved."
 * - Checklist with solid and hollow dots
 * - Amber email notification banner
 * - "Back to website" action button
 *
 * @param {{
 *   initialData?: any,
 *   businessEmail?: string,
 * }} props
 */
export const TrackingStepView = ({ initialData = null, businessEmail = '' }) => {
  const navigate = useNavigate();
  const [trackingData, setTrackingData] = useState(initialData);
  const [emailToDisplay, setEmailToDisplay] = useState(businessEmail || '');

  useEffect(() => {
    let isMounted = true;
    merchantOnboardingService
      .getTracking()
      .then((data) => {
        if (isMounted && data) {
          setTrackingData(data);
          if (data.business_email) {
            setEmailToDisplay(data.business_email);
          }
        }
      })
      .catch((err) => {
        console.warn('Tracking query error:', err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const checklist = trackingData?.checklist || {
    business_profile: true,
    store_location: true,
    business_license: true,
    payout_account: true,
    admin_approved: false,
  };

  const isAdminApproved = trackingData?.registration_status === 'APPROVED' || checklist.admin_approved;
  const userEmail = emailToDisplay || trackingData?.business_email || 'your email';

  return (
    <div style={{ textAlign: 'center', padding: '0.5rem 0 0' }}>
      {/* Centered Green Checkmark Circle */}
      <div
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: '#eaf5ea',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem',
        }}
      >
        <Check size={32} color="#2b6d28" strokeWidth={2.8} />
      </div>

      {/* Main Heading */}
      <h1
        style={{
          fontSize: '1.95rem',
          fontWeight: 800,
          color: '#1a1a1a',
          margin: '0 0 0.65rem 0',
          letterSpacing: '-0.02em',
        }}
      >
        Application submitted
      </h1>

      {/* Subtext */}
      <p
        style={{
          fontSize: '0.925rem',
          color: '#4b5563',
          lineHeight: 1.5,
          maxWidth: '430px',
          margin: '0 auto 1.75rem auto',
        }}
      >
        Admin is reviewing your business license. Your store can't receive orders until it's approved.
      </p>

      {/* Checklist Card with Solid & Hollow Dots */}
      <div
        style={{
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          padding: '1.25rem 1.5rem',
          marginBottom: '1.25rem',
          background: '#ffffff',
          textAlign: 'left',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
        }}
      >
        {/* Item 1: Business details */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: '#2b6d28',
              flexShrink: 0,
            }}
          />
          <span style={{ fontSize: '0.92rem', color: '#1f2937', fontWeight: 500 }}>
            Business details
          </span>
        </div>

        {/* Item 2: Business license uploaded */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: '#2b6d28',
              flexShrink: 0,
            }}
          />
          <span style={{ fontSize: '0.92rem', color: '#1f2937', fontWeight: 500 }}>
            Business license uploaded
          </span>
        </div>

        {/* Item 3: Stripe payout setup */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: '#2b6d28',
              flexShrink: 0,
            }}
          />
          <span style={{ fontSize: '0.92rem', color: '#1f2937', fontWeight: 500 }}>
            Stripe payout setup
          </span>
        </div>

        {/* Item 4: Admin review (Hollow ring if in review, solid if approved) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              border: '2px solid #2b6d28',
              background: isAdminApproved ? '#2b6d28' : 'transparent',
              boxSizing: 'border-box',
              flexShrink: 0,
            }}
          />
          <span style={{ fontSize: '0.92rem', color: '#1f2937', fontWeight: 500 }}>
            Admin review
          </span>
        </div>
      </div>

      {/* Amber Notification Banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: '#fef6e7',
          border: '1px solid #fde7c7',
          borderRadius: '8px',
          padding: '11px 16px',
          marginBottom: '1.25rem',
          textAlign: 'left',
        }}
      >
        <AlertTriangle size={18} color="#b45309" style={{ flexShrink: 0 }} />
        <span style={{ fontSize: '0.85rem', color: '#92400e', fontWeight: 500, lineHeight: 1.4 }}>
          We'll email {userEmail} when you're approved.
        </span>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {isAdminApproved && (
          <button
            type="button"
            onClick={() => navigate(ROUTES.DASHBOARD)}
            style={{
              display: 'block',
              width: '100%',
              boxSizing: 'border-box',
              background: '#2e7d32',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 18px',
              fontSize: '0.95rem',
              fontWeight: 700,
              cursor: 'pointer',
              textAlign: 'center',
            }}
          >
            Go to Merchant Dashboard
          </button>
        )}

        {/* Back to website Button */}
        <a
          href="/"
          style={{
            display: 'block',
            width: '100%',
            boxSizing: 'border-box',
            background: '#ffffff',
            color: '#2b6d28',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            padding: '12px 18px',
            fontSize: '0.95rem',
            fontWeight: 700,
            textDecoration: 'underline',
            textAlign: 'center',
            transition: 'background 0.15s ease',
          }}
        >
          Back to website
        </a>
      </div>
    </div>
  );
};

export default TrackingStepView;
