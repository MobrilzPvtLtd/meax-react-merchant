import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import useAuth from '../../../hooks/useAuth';
import { validateLoginForm } from '../../../utils/validators';
import { ROUTES } from '../../../utils/constants';

/**
 * Merchant Auth Feature - Login Form
 * Matches the MEAX Store Login design.
 */
export const LoginForm = () => {
  const navigate = useNavigate();
  const { login, loading, error, clearError } = useAuth();

  const [formData, setFormData] = useState({
    email: 'merchant@meax.com',
    password: 'Merchant@123456',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (error) clearError();
  };

  const handleQuickFill = (email, password) => {
    setFormData({ email, password });
    setValidationErrors({});
    if (error) clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { isValid, errors } = validateLoginForm(formData);
    if (!isValid) {
      setValidationErrors(errors);
      return;
    }

    try {
      await login({
        email: formData.email.trim(),
        password: formData.password,
      });
    } catch {
      // Error handled in auth store
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="login-form">
        {error && (
          <div className="login-error-banner">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Email Field */}
        <div className="login-field">
          <label htmlFor="login-email" className="login-label">
            Email
          </label>
          <div className="login-input-wrapper">
            <input
              id="login-email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="dana@lonestarpizza.com"
              className={`login-input ${validationErrors.email ? 'has-error' : ''}`}
              autoComplete="email"
              required
            />
          </div>
          {validationErrors.email && (
            <span className="login-field-error">{validationErrors.email}</span>
          )}
        </div>

        {/* Password Field */}
        <div className="login-field">
          <label htmlFor="login-password" className="login-label">
            Password
          </label>
          <div className="login-input-wrapper">
            <input
              id="login-password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••••"
              className={`login-input ${validationErrors.password ? 'has-error' : ''}`}
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              className="login-input-toggle"
              onClick={() => setShowPassword(!showPassword)}
              title={showPassword ? 'Hide password' : 'Show password'}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {validationErrors.password && (
            <span className="login-field-error">{validationErrors.password}</span>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="login-submit-button"
          disabled={loading}
          style={{ background: '#2e7d32' }}
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
              <span>Logging in...</span>
            </>
          ) : (
            'Log in'
          )}
        </button>

        {/* Links */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '0.5rem' }}>
          <Link
            to={ROUTES.RESET_PASSWORD}
            className="login-forgot-link"
            style={{ color: '#2e7d32' }}
          >
            Forgot password?
          </Link>

          <div style={{ fontSize: '0.84rem', color: '#6b7280' }}>
            New to MEAX?{' '}
            <Link
              to={ROUTES.REGISTER}
              style={{ color: '#2e7d32', fontWeight: 600, textDecoration: 'underline' }}
            >
              Become a merchant
            </Link>
          </div>
        </div>

        {/* Demo Accounts Helper */}
        <div
          style={{
            marginTop: '1.25rem',
            padding: '10px 14px',
            background: '#f4fbf4',
            border: '1px solid #d2ebd0',
            borderRadius: '8px',
            fontSize: '0.78rem',
            color: '#2a5a27',
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: '6px' }}>Demo Merchant Accounts:</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            <button
              type="button"
              onClick={() => handleQuickFill('merchant@meax.com', 'Merchant@123456')}
              style={{
                background: '#fff',
                border: '1px solid #8cd162',
                borderRadius: '6px',
                padding: '3px 8px',
                cursor: 'pointer',
                fontSize: '0.75rem',
                color: '#1b4313',
                fontWeight: 600,
              }}
            >
              merchant@meax.com
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('dana@lonestarpizza.com', 'password123')}
              style={{
                background: '#fff',
                border: '1px solid #8cd162',
                borderRadius: '6px',
                padding: '3px 8px',
                cursor: 'pointer',
                fontSize: '0.75rem',
                color: '#1b4313',
                fontWeight: 600,
              }}
            >
              dana@lonestarpizza.com
            </button>
          </div>
        </div>
      </form>
    </>
  );
};

export default LoginForm;
