import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home,
  Receipt,
  UtensilsCrossed,
  DollarSign,
  Star,
  Settings,
  Store,
  Clock
} from 'lucide-react';
import { ROUTES } from '../../utils/constants';

const navItems = [
  { label: 'Dashboard',   path: ROUTES.DASHBOARD,  icon: Home                           },
  { label: 'Live Orders', path: ROUTES.ORDERS,     icon: Receipt,         badge: 3      },
  { label: 'Menu & Items',path: ROUTES.MENU,       icon: UtensilsCrossed                },
  { label: 'Earnings',    path: '/earnings',       icon: DollarSign                     },
  { label: 'Reviews',     path: '/reviews',        icon: Star                           },
  { label: 'Store Settings', path: ROUTES.SETTINGS, icon: Settings                      },
];

export const Sidebar = () => {
  return (
    <aside
      style={{
        width: '220px',
        background: '#ffffff',
        borderRight: '1px solid #e8f0e3',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'fixed',
        top: 0,
        left: 0,
        overflowY: 'auto',
        zIndex: 100,
        fontFamily: 'inherit',
      }}
    >
      {/* ── Brand ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '20px 16px 16px' }}>
        <div
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: '#5cb85c',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Store size={20} color="#fff" strokeWidth={2} />
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: '1rem', color: '#1a1a1a', lineHeight: 1.2, letterSpacing: '-0.02em' }}>
            MEAX
          </div>
          <div style={{ fontSize: '0.72rem', color: '#6b7280', fontWeight: 500 }}>
            Merchant panel
          </div>
        </div>
      </div>

      {/* ── Nav ── */}
      <nav style={{ flex: 1, padding: '4px 8px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {navItems.map(({ label, path, icon: Icon, badge }) => (
          <NavLink
            key={label}
            to={path}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '9px 10px',
              borderRadius: '8px',
              textDecoration: 'none',
              background: isActive ? '#eaf4ea' : 'transparent',
              transition: 'background 0.15s',
            })}
            className="sidebar-nav-link"
          >
            {({ isActive }) => (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Icon
                    size={17}
                    strokeWidth={1.8}
                    color={isActive ? '#3a7d44' : '#4a5568'}
                  />
                  <span
                    style={{
                      fontSize: '0.84rem',
                      fontWeight: isActive ? 700 : 500,
                      color: isActive ? '#3a7d44' : '#374151',
                      lineHeight: 1,
                    }}
                  >
                    {label}
                  </span>
                </div>
                {badge && (
                  <span
                    style={{
                      background: '#e53e3e',
                      color: '#fff',
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      borderRadius: '999px',
                      minWidth: '18px',
                      height: '18px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '0 5px',
                    }}
                  >
                    {badge}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* ── Store Status & Footer ── */}
      <div style={{ padding: '16px 12px 20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '10px' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              background: '#eaf4ea',
              color: '#3a7d44',
              fontSize: '0.72rem',
              fontWeight: 700,
              padding: '4px 10px',
              borderRadius: '5px',
              alignSelf: 'flex-start',
            }}
          >
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#3a7d44' }}></span>
            Store Open
          </span>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              background: '#f3f4f6',
              color: '#4b5563',
              fontSize: '0.72rem',
              fontWeight: 600,
              padding: '4px 10px',
              borderRadius: '5px',
              alignSelf: 'flex-start',
            }}
          >
            <Clock size={12} /> Prep time: 15-20m
          </span>
        </div>
        <div style={{ fontSize: '0.72rem', color: '#9ca3af', fontWeight: 500 }}>
          Lone Star Pizza & Pasta, DFW
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
