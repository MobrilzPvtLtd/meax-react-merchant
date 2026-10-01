import React from 'react';
import { APP_CONFIG } from '../../utils/constants';

/**
 * Standard Application Footer for Merchant Portal
 */
export const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer
      style={{
        height: 'var(--footer-height, 56px)',
        background: '#ffffff',
        borderTop: '1px solid #e8f0e3',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 2rem',
        fontSize: '0.8125rem',
        color: '#6b7280',
      }}
    >
      <div>
        © {year} <strong>{APP_CONFIG.NAME}</strong>. All rights reserved.
      </div>
      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
        <span>Dallas-Fort Worth Merchant Network</span>
      </div>
    </footer>
  );
};

export default Footer;
