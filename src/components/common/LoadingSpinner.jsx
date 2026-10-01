import React from 'react';

/**
 * LoadingSpinner Component
 * Accessible, branded loading indicator for Suspense and async operations.
 */
export const LoadingSpinner = ({ fullScreen = false, message = 'Loading...' }) => {
  const content = (
    <div
      role="status"
      aria-live="polite"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        padding: '2rem',
      }}
    >
      <div
        style={{
          width: '38px',
          height: '38px',
          border: '3px solid #e8f0e3',
          borderTopColor: '#2e7d32',
          borderRadius: '50%',
          animation: 'spin 0.75s linear infinite',
        }}
      />
      {message && (
        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#4b5563' }}>
          {message}
        </span>
      )}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );

  if (fullScreen) {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
        }}
      >
        {content}
      </div>
    );
  }

  return content;
};

export default LoadingSpinner;
