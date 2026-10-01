import React, { useState } from 'react';
import { ShoppingBag, Clock, CheckCircle2, User, Phone, MapPin } from 'lucide-react';

const mockOrders = [
  {
    id: '#ORD-8821',
    customer: 'Sarah Jenkins',
    phone: '+1 214-555-0144',
    address: '2201 Main St, Dallas, TX',
    items: [
      { name: '14" Margherita Pizza', qty: 2, price: '$16.00' },
      { name: 'Garlic Knots (6pcs)', qty: 1, price: '$6.50' },
    ],
    total: '$38.50',
    status: 'In Kitchen',
    time: 'Ordered 6 min ago',
    driver: 'Searching for driver...',
  },
  {
    id: '#ORD-8820',
    customer: 'Marcus Rodriguez',
    phone: '+1 214-555-0182',
    address: '405 Elm St, Dallas, TX',
    items: [
      { name: 'Pepperoni Feast Pizza', qty: 1, price: '$18.99' },
      { name: 'Mexican Coke', qty: 2, price: '$6.00' },
    ],
    total: '$24.99',
    status: 'Ready for Driver',
    time: 'Ordered 15 min ago',
    driver: 'Driver David K. (Arriving in 3m)',
  },
  {
    id: '#ORD-8822',
    customer: 'Anthony Vance',
    phone: '+1 214-555-0199',
    address: '1802 Commerce St, Dallas, TX',
    items: [
      { name: 'Fettuccine Alfredo', qty: 1, price: '$17.50' },
      { name: 'Caesar Salad', qty: 1, price: '$8.50' },
    ],
    total: '$26.00',
    status: 'New',
    time: 'Just now',
    driver: 'Unassigned',
  },
];

export const Orders = () => {
  const [orders, setOrders] = useState(mockOrders);
  const [filter, setFilter] = useState('ALL');

  const updateStatus = (orderId, newStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
  };

  const filteredOrders =
    filter === 'ALL' ? orders : orders.filter((o) => o.status === filter);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>Live Orders</h1>
          <p style={{ color: '#6b7280', fontSize: '0.875rem', margin: '4px 0 0' }}>
            Manage kitchen queue, prep tickets and driver handoffs
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          {['ALL', 'New', 'In Kitchen', 'Ready for Driver'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                border: '1px solid #e8f0e3',
                background: filter === tab ? '#3a7d44' : '#fff',
                color: filter === tab ? '#fff' : '#4b5563',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.25rem' }}>
        {filteredOrders.map((order) => (
          <div
            key={order.id}
            style={{
              background: '#fff',
              border: '1px solid #e8f0e3',
              borderRadius: '12px',
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontWeight: 800, fontSize: '1rem', color: '#1a1a1a' }}>{order.id}</span>
                <span style={{ fontSize: '0.75rem', color: '#9ca3af', marginLeft: '8px' }}>{order.time}</span>
              </div>
              <span
                style={{
                  padding: '4px 10px',
                  borderRadius: '999px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  background:
                    order.status === 'New'
                      ? '#fee2e2'
                      : order.status === 'In Kitchen'
                      ? '#fef3c7'
                      : '#e0e7ff',
                  color:
                    order.status === 'New'
                      ? '#b91c1c'
                      : order.status === 'In Kitchen'
                      ? '#92400e'
                      : '#3730a3',
                }}
              >
                {order.status}
              </span>
            </div>

            <div style={{ fontSize: '0.82rem', color: '#4b5563', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <User size={14} color="#6b7280" />
                <span style={{ fontWeight: 600, color: '#1a1a1a' }}>{order.customer}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Phone size={14} color="#6b7280" />
                <span>{order.phone}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MapPin size={14} color="#6b7280" />
                <span>{order.address}</span>
              </div>
            </div>

            <div style={{ borderTop: '1px dashed #e8f0e3', paddingTop: '10px' }}>
              <div style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 600, marginBottom: '6px' }}>
                ORDER ITEMS
              </div>
              {order.items.map((it, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '4px' }}>
                  <span>{it.qty}x {it.name}</span>
                  <span style={{ fontWeight: 600 }}>{it.price}</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e8f0e3', paddingTop: '10px' }}>
              <div>
                <div style={{ fontSize: '0.72rem', color: '#9ca3af' }}>TOTAL AMOUNT</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1a1a1a' }}>{order.total}</div>
              </div>

              {order.status === 'New' && (
                <button
                  onClick={() => updateStatus(order.id, 'In Kitchen')}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    background: '#2e7d32',
                    color: '#fff',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                  }}
                >
                  Accept & Send to Kitchen
                </button>
              )}

              {order.status === 'In Kitchen' && (
                <button
                  onClick={() => updateStatus(order.id, 'Ready for Driver')}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    background: '#1d4ed8',
                    color: '#fff',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                  }}
                >
                  Mark Ready for Driver
                </button>
              )}

              {order.status === 'Ready for Driver' && (
                <span style={{ fontSize: '0.78rem', color: '#166534', fontWeight: 700 }}>
                  ✓ Awaiting Driver Pickup
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;
