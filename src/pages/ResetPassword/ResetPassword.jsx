import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../utils/constants';

export const ResetPassword = () => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f7faf7', padding: '1rem' }}>
      <div className="card" style={{ maxWidth: '420px', width: '100%', padding: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 0.5rem 0' }}>Reset Password</h1>
        <p style={{ color: '#6b7280', fontSize: '0.85rem', margin: '0 0 1.5rem 0' }}>
          Enter your registered merchant email address and we'll send you recovery instructions.
        </p>

        {sent ? (
          <div>
            <div style={{ padding: '12px', background: '#ecfdf5', color: '#065f46', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, marginBottom: '1.25rem' }}>
              ✓ Reset link sent! Please check your inbox.
            </div>
            <Link to={ROUTES.LOGIN} style={{ color: '#2e7d32', fontWeight: 700, fontSize: '0.85rem' }}>
              ← Return to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                Store Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="dana@lonestarpizza.com"
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db' }}
              />
            </div>

            <button
              type="submit"
              style={{
                padding: '10px',
                borderRadius: '8px',
                background: '#2e7d32',
                color: '#fff',
                border: 'none',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Send Reset Link
            </button>

            <Link to={ROUTES.LOGIN} style={{ color: '#6b7280', fontSize: '0.82rem', textAlign: 'center', marginTop: '0.5rem' }}>
              Cancel and return to login
            </Link>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
