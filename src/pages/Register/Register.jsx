import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import OnboardingStepper from '../../components/features/onboarding/OnboardingStepper';
import BusinessStepForm from '../../components/features/onboarding/BusinessStepForm';
import LocationStepForm from '../../components/features/onboarding/LocationStepForm';
import LicenseStepForm from '../../components/features/onboarding/LicenseStepForm';
import PayoutStepForm from '../../components/features/onboarding/PayoutStepForm';
import TrackingStepView from '../../components/features/onboarding/TrackingStepView';
import merchantOnboardingService from '../../services/merchantOnboardingService';
import { ROUTES } from '../../utils/constants';
import meaxLogo from '../../assets/images/meax-logo.png';
import '../Login/Login.css';

/**
 * Merchant Registration & Onboarding Page
 * Clean URL: /register (no step id in query parameters)
 *
 * Uses GET /api/v1/auth/merchant/onboarding/tracking to automatically determine
 * active step and restore saved data.
 *
 * Once business profile is registered, the merchant cannot navigate back to Step 1.
 * When clicking "Back" between onboarding steps, previously entered data is retained.
 */
export const Register = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [onboardingData, setOnboardingData] = useState({});

  // Query backend tracking on mount to determine current onboarding step and restore saved data
  useEffect(() => {
    let isMounted = true;

    const fetchTracking = async () => {
      try {
        const response = await merchantOnboardingService.getTracking();
        const tracking = response?.data || response;
        if (!isMounted || !tracking) return;

        // If admin has approved this merchant, route straight to Dashboard
        if (tracking.registration_status === 'APPROVED' || tracking.checklist?.admin_approved) {
          navigate(ROUTES.DASHBOARD, { replace: true });
          return;
        }

        // Map current step based on /api/v1/auth/merchant/onboarding/tracking
        if (
          tracking.registration_status === 'UNDER_REVIEW' ||
          tracking.registration_status === 'REJECTED' ||
          tracking.current_step === 'TRACKING'
        ) {
          setCurrentStep(5);
        } else if (tracking.current_step === 'PAYOUTS') {
          setCurrentStep(4);
        } else if (tracking.current_step === 'LICENSE') {
          setCurrentStep(3);
        } else if (tracking.current_step === 'DETAILS') {
          setCurrentStep(2);
        } else {
          setCurrentStep(1);
        }

        // Restore saved profile & location data into state
        setOnboardingData((prev) => ({
          ...prev,
          business: {
            business_name: tracking.business_name || prev.business?.business_name || '',
            business_email: tracking.business_email || prev.business?.business_email || '',
            business_phone: tracking.business_phone || prev.business?.business_phone || '',
            store_category_type: tracking.store_category_type || prev.business?.store_category_type || 1,
          },
          location:
            tracking.store_location ||
            (tracking.store_address ? { store_address: tracking.store_address } : prev.location) ||
            null,
          license: tracking.license_document_url
            ? { license_document_url: tracking.license_document_url }
            : prev.license || null,
          payout: tracking.payout_account || prev.payout || null,
        }));
      } catch {
        // Unauthenticated visitor -> start on Step 1: Business Profile
      }
    };

    fetchTracking();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  const handleStep1Complete = (data) => {
    setOnboardingData((prev) => ({ ...prev, business: data }));
    setCurrentStep(2);
  };

  const handleStep2Complete = (data) => {
    setOnboardingData((prev) => ({ ...prev, location: data }));
    setCurrentStep(3);
  };

  const handleStep3Complete = (data) => {
    setOnboardingData((prev) => ({ ...prev, license: data }));
    setCurrentStep(4);
  };

  const handleStep4Complete = (data) => {
    setOnboardingData((prev) => ({ ...prev, payout: data }));
    setCurrentStep(5);
  };

  return (
    <div className="login-root">
      {/* Left Brand Panel */}
      <aside
        className="login-left-panel"
        aria-label="Brand Overview"
        style={{ backgroundColor: '#8cd162' }}
      >
        <div className="login-brand-top">
          <img
            src={meaxLogo}
            alt="MEAX Food and Groceries Delivery"
            className="login-logo-img"
          />
        </div>

        <div className="login-brand-bottom">
          <h2
            className="login-console-title"
            style={{
              fontSize: '1.75rem',
              fontWeight: 800,
              color: '#1b4313',
              lineHeight: 1.25,
            }}
          >
            Reach customers across Dallas-Fort Worth with delivery handled for you.
          </h2>
          <p
            className="login-console-desc"
            style={{
              color: '#274d1c',
              marginTop: '1rem',
              fontSize: '0.95rem',
              maxWidth: '360px',
            }}
          >
            Manage your menu, accept orders and track payouts in one place.
          </p>
        </div>
      </aside>

      {/* Right Form Panel */}
      <main
        className="login-right-panel"
        aria-label="Merchant Registration"
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2.5rem 1.5rem',
          background: '#fcfdfb',
          overflowY: 'auto',
        }}
      >
        <div
          style={{
            maxWidth: '540px',
            width: '100%',
            boxSizing: 'border-box',
          }}
        >
          {/* 4-Step Progress Indicator (Visible for Steps 1-4 only) */}
          {currentStep <= 4 && <OnboardingStepper currentStep={currentStep} />}

          {/* Step 1: Business Profile Form */}
          {currentStep === 1 && (
            <BusinessStepForm
              initialData={onboardingData.business}
              onStepComplete={handleStep1Complete}
            />
          )}

          {/* Step 2: Store Location / Details Form - Cannot navigate back to Step 1 account registration */}
          {currentStep === 2 && (
            <LocationStepForm
              initialData={onboardingData.location}
              onStepComplete={handleStep2Complete}
            />
          )}

          {/* Step 3: Business License Upload Form */}
          {currentStep === 3 && (
            <LicenseStepForm
              initialData={onboardingData.license}
              onBack={() => setCurrentStep(2)}
              onStepComplete={handleStep3Complete}
            />
          )}

          {/* Step 4: Stripe Connect Payout Setup Flow */}
          {currentStep === 4 && (
            <PayoutStepForm
              initialBusinessName={onboardingData.business?.business_name || ''}
              businessEmail={onboardingData.business?.business_email || ''}
              initialData={onboardingData.payout}
              onBack={() => setCurrentStep(3)}
              onStepComplete={handleStep4Complete}
            />
          )}

          {/* Step 5: Application Submitted & Review Tracking */}
          {currentStep === 5 && (
            <TrackingStepView
              initialData={onboardingData.payout}
              businessEmail={onboardingData.business?.business_email || ''}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default Register;
