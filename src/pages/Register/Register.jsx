import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
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
 * Step 1: Business Profile Setup
 * Step 2: Store Location / Details
 * Step 3: Licensing
 * Step 4: Payouts (Stripe Connect)
 * Step 5: Tracking & Review Status
 */
export const Register = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const stepQuery = parseInt(searchParams.get('step') || '1', 10);
  const [currentStep, setCurrentStep] = useState(
    stepQuery >= 1 && stepQuery <= 5 ? stepQuery : 1
  );
  const [onboardingData, setOnboardingData] = useState({});

  // Sync state when query param changes externally
  useEffect(() => {
    if (stepQuery >= 1 && stepQuery <= 5 && stepQuery !== currentStep) {
      setCurrentStep(stepQuery);
    }
  }, [stepQuery]);

  // If already approved, redirect to dashboard; if visiting /register without ?step=, align to active step
  useEffect(() => {
    let isMounted = true;
    const checkStatus = async () => {
      try {
        const response = await merchantOnboardingService.getTracking();
        const tracking = response?.data || response;
        if (!isMounted || !tracking) return;

        // If admin has approved this merchant, route them straight to Dashboard
        if (tracking.registration_status === 'APPROVED' || tracking.checklist?.admin_approved) {
          navigate(ROUTES.DASHBOARD, { replace: true });
          return;
        }

        // If user accessed /register without an explicit step param, navigate to where they left off
        if (!searchParams.get('step')) {
          if (
            tracking.registration_status === 'UNDER_REVIEW' ||
            tracking.registration_status === 'REJECTED' ||
            tracking.current_step === 'TRACKING'
          ) {
            setCurrentStep(5);
            setSearchParams({ step: '5' }, { replace: true });
          } else if (tracking.current_step) {
            const stepMap = {
              BUSINESS: 1,
              DETAILS: 2,
              LICENSE: 3,
              PAYOUTS: 4,
              TRACKING: 5,
            };
            const target = stepMap[tracking.current_step] || 2;
            setCurrentStep(target);
            setSearchParams({ step: String(target) }, { replace: true });
          }
        }
      } catch {
        // Not authenticated or no merchant record yet -> stay on Step 1
      }
    };

    checkStatus();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleStep1Complete = (data) => {
    setOnboardingData((prev) => ({ ...prev, business: data }));
    setCurrentStep(2);
    setSearchParams({ step: '2' });
  };

  const handleStep2Complete = (data) => {
    setOnboardingData((prev) => ({ ...prev, location: data }));
    setCurrentStep(3);
    setSearchParams({ step: '3' });
  };

  const handleStep3Complete = (data) => {
    setOnboardingData((prev) => ({ ...prev, license: data }));
    setCurrentStep(4);
    setSearchParams({ step: '4' });
  };

  const handleStep4Complete = (data) => {
    setOnboardingData((prev) => ({ ...prev, payout: data }));
    setCurrentStep(5);
    setSearchParams({ step: '5' });
  };

  const handleBackToStep1 = () => {
    setCurrentStep(1);
    setSearchParams({ step: '1' });
  };

  const handleBackToStep2 = () => {
    setCurrentStep(2);
    setSearchParams({ step: '2' });
  };

  const handleBackToStep3 = () => {
    setCurrentStep(3);
    setSearchParams({ step: '3' });
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
            <BusinessStepForm onStepComplete={handleStep1Complete} />
          )}

          {/* Step 2: Store Location / Details Form */}
          {currentStep === 2 && (
            <LocationStepForm
              onBack={handleBackToStep1}
              onStepComplete={handleStep2Complete}
            />
          )}

          {/* Step 3: Business License Upload Form */}
          {currentStep === 3 && (
            <LicenseStepForm
              onBack={handleBackToStep2}
              onStepComplete={handleStep3Complete}
            />
          )}

          {/* Step 4: Stripe Connect Payout Setup Flow (Images 1 & 2) */}
          {currentStep === 4 && (
            <PayoutStepForm
              initialBusinessName={onboardingData.business?.business_name || ''}
              businessEmail={onboardingData.business?.business_email || ''}
              onBack={handleBackToStep3}
              onStepComplete={handleStep4Complete}
            />
          )}

          {/* Step 5: Application Submitted & Review Tracking (Image 3) */}
          {currentStep === 5 && (
            <TrackingStepView
              initialData={onboardingData.payout}
              businessEmail={onboardingData.business?.business_email || ''}
              onRestart={handleBackToStep1}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default Register;
