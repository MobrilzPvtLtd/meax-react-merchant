import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bell, ChevronDown, LogOut, CheckCircle2 } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import { ROUTES } from '../../utils/constants';
import { getInitials } from '../../utils/helpers';
import { useHeader } from '../../context/HeaderContext';

/** Map routes → page titles shown in the header */
const PAGE_TITLES = {
  '/dashboard': { subtitle: 'Lone Star Pizza & Pasta, DFW', title: 'Dashboard' },
  '/orders': { subtitle: 'Live kitchen & customer orders', title: 'Live Orders' },
  '/menu': { subtitle: 'Categories, pricing & inventory', title: 'Menu & Items' },
  '/earnings': { subtitle: 'Weekly sales & bank deposits', title: 'Earnings & Payouts' },
  '/reviews': { subtitle: 'Customer feedback & ratings', title: 'Reviews' },
  '/settings': { subtitle: 'Business profile & operating hours', title: 'Store Settings' },
  '/account': { subtitle: 'Account management', title: 'Account' },
};

export const Header = () => {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { headerState } = useHeader() || {};
  const [isAccepting, setIsAccepting] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  const page = PAGE_TITLES[pathname] || { subtitle: 'Lone Star Pizza & Pasta, DFW', title: 'Dashboard' };
  const title = headerState?.title || page.title;
  const subtitle = headerState?.subtitle || page.subtitle;

  const storeName = user?.storeName || user?.name || 'Lone Star Pizza';

  return (
    <header
      style={{
        background: '#fff',
        borderBottom: '1px solid #e8f0e3',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.5rem',
        height: '68px',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      {/* Left – page title */}
      <div>
        <div style={{ fontSize: '0.72rem', color: '#9ca3af', marginBottom: '2px' }}>
          {subtitle}
        </div>
        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1a1a1a', lineHeight: 1 }}>
          {title}
        </div>
      </div>

      {/* Right controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {headerState?.rightActions}

        {/* Store Active Toggle */}
        <button
          onClick={() => setIsAccepting(!isAccepting)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            borderRadius: '999px',
            border: `1px solid ${isAccepting ? '#c7e6c7' : '#fecaca'}`,
            background: isAccepting ? '#f0fdf4' : '#fef2f2',
            color: isAccepting ? '#166534' : '#991b1b',
            fontSize: '0.78rem',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: isAccepting ? '#22c55e' : '#ef4444',
            }}
          />
          {isAccepting ? 'Accepting Orders' : 'Store Paused'}
        </button>

        {/* Notifications */}
        <button
          title="Notifications"
          style={{
            position: 'relative',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: '#6b7280',
            display: 'flex',
            alignItems: 'center',
            padding: '6px',
          }}
        >
          <Bell size={20} />
          <span
            style={{
              position: 'absolute',
              top: '4px',
              right: '4px',
              width: '8px',
              height: '8px',
              background: '#e53e3e',
              borderRadius: '50%',
              border: '1.5px solid #fff',
            }}
          />
        </button>

        {/* User / Merchant pill */}
        <div style={{ position: 'relative' }}>
          <div
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: 'pointer',
              padding: '4px 10px 4px 4px',
              borderRadius: '999px',
              border: '1px solid #e8f0e3',
              background: '#f9faf7',
            }}
          >
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: '#d4eddb',
                color: '#3a7d44',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.72rem',
              }}
            >
              {getInitials(storeName)}
            </div>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#1a1a1a', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {storeName}
            </span>
            <ChevronDown size={13} color="#6b7280" />
          </div>

          {menuOpen && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                background: '#ffffff',
                border: '1px solid #e8f0e3',
                borderRadius: '10px',
                boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
                width: '180px',
                padding: '6px',
                zIndex: 100,
              }}
            >
              <button
                onClick={() => {
                  setMenuOpen(false);
                  navigate(ROUTES.SETTINGS);
                }}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '8px 12px',
                  background: 'none',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '0.82rem',
                  color: '#374151',
                  cursor: 'pointer',
                  fontWeight: 500,
                }}
              >
                Store Settings
              </button>
              <div style={{ height: '1px', background: '#f3f4f6', margin: '4px 0' }}></div>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  logout();
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 12px',
                  background: 'none',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '0.82rem',
                  color: '#dc2626',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                <LogOut size={14} /> Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
