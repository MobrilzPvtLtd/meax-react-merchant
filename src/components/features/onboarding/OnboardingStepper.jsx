import React from 'react';

const STEPS = [
  { id: 1, label: '1. Business' },
  { id: 2, label: '2. Details' },
  { id: 3, label: '3. License' },
  { id: 4, label: '4. Payouts' },
];

/**
 * OnboardingStepper Component
 * Displays 4-step progress with active indicator bars
 */
export const OnboardingStepper = ({ currentStep = 1 }) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        width: '100%',
        marginBottom: '2rem',
      }}
    >
      {STEPS.map((step) => {
        const isActive = step.id === currentStep;
        const isCompleted = step.id < currentStep;

        return (
          <div
            key={step.id}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            {/* Top Indicator Bar */}
            <div
              style={{
                height: '3px',
                borderRadius: '2px',
                background: isActive || isCompleted ? '#2e7d32' : '#e5e7eb',
                transition: 'background 0.2s ease',
              }}
            />
            {/* Step Label */}
            <span
              style={{
                fontSize: '0.78rem',
                fontWeight: isActive ? 700 : 500,
                color: isActive ? '#1b4313' : '#6b7280',
                transition: 'color 0.2s ease',
              }}
            >
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default OnboardingStepper;
