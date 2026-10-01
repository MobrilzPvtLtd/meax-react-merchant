import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, UtensilsCrossed, Clock, CheckCircle2, ChevronRight, DollarSign, Star, AlertTriangle } from 'lucide-react';
import { ROUTES } from '../../utils/constants';

const StatCard = ({ label, value, sub, highlight = false }) => (
  <div
    style={{
      background: '#fff',
      border: '1px solid #e8f0e3',
      borderRadius: '12px',
      padding: '1rem 1.25rem',
      flex: 1,
      minWidth: 0,
    }}
  >
    <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.35rem' }}>{label}</div>
    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: highlight ? '#2e7d32' : '#1a1a1a', lineHeight: 1.1 }}>
      {value}
    </div>
    {sub && <div style={{ fontSize: '0.72rem', color: '#9ca3af', marginTop: '0.3rem' }}>{sub}</div>}
  </div>
);

const ActionCard = ({ icon: Icon, count, label, sub, onClick }) => (
  <button
    onClick={onClick}
    style={{
      background: '#fff',
      border: '1px solid #e8f0e3',
      borderRadius: '12px',
      padding: '1rem 1.25rem',
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      cursor: 'pointer',
      textAlign: 'left',
      transition: 'border-color 0.15s',
    }}
  >
    <div
      style={{
        width: '36px',
        height: '36px',
        borderRadius: '8px',
        background: '#eaf4ea',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <Icon size={18} color="#3a7d44" strokeWidth={1.8} />
    </div>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1a1a1a' }}>
        {count} {label}
      </div>
      <div style={{ fontSize: '0.72rem', color: '#9ca3af' }}>{sub}</div>
    </div>
    <ChevronRight size={16} color="#9ca3af" />
  </button>
);

export const Dashboard = () => {
  const navigate = useNavigate();

  const recentOrders = [
    { id: '#ORD-8821', customer: 'Sarah Jenkins', items: '2x Margherita, 1x Garlic Knots', total: '$38.50', status: 'In Kitchen', time: '4m ago' },
    { id: '#ORD-8820', customer: 'Marcus Rodriguez', items: '1x Pepperoni Feast, 2x Coca Cola', total: '$24.99', status: 'Ready for Driver', time: '12m ago' },
    { id: '#ORD-8819', customer: 'Emily Chen', items: '1x Truffle Mushroom Pasta', total: '$19.00', status: 'Completed', time: '28m ago' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* ── Top Stat Cards ── */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <StatCard label="Today's Orders" value="32" sub="+8 vs yesterday" highlight />
        <StatCard label="Today's Gross Sales" value="$842.80" sub="Average ticket $26.33" />
        <StatCard label="Avg Preparation Time" value="16 min" sub="Target < 20 min" />
        <StatCard label="Store Rating" value="4.8 ★" sub="Based on 142 reviews" />
      </div>

      {/* ── Action Prompts ── */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <ActionCard
          icon={ShoppingBag}
          count={3}
          label="Orders In Kitchen"
          sub="Requires prep and expediting"
          onClick={() => navigate(ROUTES.ORDERS)}
        />
        <ActionCard
          icon={CheckCircle2}
          count={2}
          label="Ready for Pickup"
          sub="Drivers dispatched nearby"
          onClick={() => navigate(ROUTES.ORDERS)}
        />
        <ActionCard
          icon={UtensilsCrossed}
          count={4}
          label="Items Sold Out"
          sub="Update catalog availability"
          onClick={() => navigate(ROUTES.MENU)}
        />
      </div>

      {/* ── Live Orders Table ── */}
      <div
        style={{
          background: '#fff',
          border: '1px solid #e8f0e3',
          borderRadius: '12px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid #e8f0e3',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>Active Orders Feed</h2>
            <p style={{ fontSize: '0.8rem', color: '#6b7280', margin: '2px 0 0' }}>
              Real-time incoming customer orders for delivery
            </p>
          </div>
          <button
            onClick={() => navigate(ROUTES.ORDERS)}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              border: '1px solid #e8f0e3',
              background: '#f9faf7',
              color: '#3a7d44',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            View All Orders
          </button>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ background: '#fafbfa', borderBottom: '1px solid #e8f0e3', color: '#6b7280' }}>
              <th style={{ padding: '12px 18px', fontWeight: 600 }}>Order ID</th>
              <th style={{ padding: '12px 18px', fontWeight: 600 }}>Customer</th>
              <th style={{ padding: '12px 18px', fontWeight: 600 }}>Items</th>
              <th style={{ padding: '12px 18px', fontWeight: 600 }}>Total</th>
              <th style={{ padding: '12px 18px', fontWeight: 600 }}>Status</th>
              <th style={{ padding: '12px 18px', fontWeight: 600 }}>Time</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.map((order, i) => (
              <tr
                key={order.id}
                style={{
                  borderBottom: i < recentOrders.length - 1 ? '1px solid #f0f4ee' : 'none',
                }}
              >
                <td style={{ padding: '14px 18px', fontWeight: 700, color: '#1a1a1a' }}>{order.id}</td>
                <td style={{ padding: '14px 18px', fontWeight: 600 }}>{order.customer}</td>
                <td style={{ padding: '14px 18px', color: '#4b5563' }}>{order.items}</td>
                <td style={{ padding: '14px 18px', fontWeight: 700 }}>{order.total}</td>
                <td style={{ padding: '14px 18px' }}>
                  <span
                    style={{
                      padding: '4px 10px',
                      borderRadius: '999px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      background:
                        order.status === 'In Kitchen'
                          ? '#fef3c7'
                          : order.status === 'Ready for Driver'
                          ? '#e0e7ff'
                          : '#eaf4ea',
                      color:
                        order.status === 'In Kitchen'
                          ? '#92400e'
                          : order.status === 'Ready for Driver'
                          ? '#3730a3'
                          : '#166534',
                    }}
                  >
                    {order.status}
                  </span>
                </td>
                <td style={{ padding: '14px 18px', color: '#9ca3af' }}>{order.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;
