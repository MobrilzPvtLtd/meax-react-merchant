import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import LoginForm from '../../components/features/auth/LoginForm';
import useAuth from '../../hooks/useAuth';
import { ROUTES } from '../../utils/constants';
import meaxLogo from '../../assets/images/meax-logo.png';
import './Login.css';

/**
 * Merchant Login Page
 * Custom branded authentication screen for MEAX Merchant Portal.
 */
export const Login = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isAuthenticated) {
      const target = location.state?.from?.pathname || ROUTES.DASHBOARD;
      navigate(target, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  return (
    <div className="login-root">
      {/* Left Brand Panel */}
      <aside className="login-left-panel" aria-label="Brand Overview" style={{ backgroundColor: '#8cd162' }}>
        <div className="login-brand-top">
          <img
            src={meaxLogo}
            alt="MEAX Food and Groceries Delivery"
            className="login-logo-img"
          />
        </div>

        <div className="login-brand-bottom">
          <h2 className="login-console-title" style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1b4313', lineHeight: 1.25 }}>
            Reach customers across Dallas-Fort Worth with delivery handled for you.
          </h2>
          <p className="login-console-desc" style={{ color: '#274d1c', marginTop: '1rem', fontSize: '0.95rem' }}>
            Manage your menu, accept orders and track payouts in one place.
          </p>
        </div>
      </aside>

      {/* Right Authentication Panel */}
      <main className="login-right-panel" aria-label="Merchant Authentication">
        <div className="login-form-container">
          <h1 className="login-heading" style={{ fontSize: '2rem', fontWeight: 800 }}>
            Log in to your store
          </h1>
          <LoginForm />
        </div>
      </main>
    </div>
  );
};

export default Login;
