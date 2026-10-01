import React, { useState } from 'react';
import { UtensilsCrossed, Plus, Check, X } from 'lucide-react';

const initialMenu = [
  { id: 1, name: 'Margherita Pizza 14"', category: 'Pizzas', price: '$16.00', available: true, description: 'San Marzano tomatoes, fresh mozzarella, basil, EVOO.' },
  { id: 2, name: 'Pepperoni Feast 14"', category: 'Pizzas', price: '$18.99', available: true, description: 'Double crispy pepperoni, mozzarella, hot honey drizzle.' },
  { id: 3, name: 'Truffle Mushroom Pasta', category: 'Pastas', price: '$19.00', available: true, description: 'Fettuccine, black truffle cream, cremini mushrooms.' },
  { id: 4, name: 'Garlic Knots (6pcs)', category: 'Sides', price: '$6.50', available: false, description: 'Baked dough with garlic butter, parmesan, marinara.' },
  { id: 5, name: 'Caesar Salad', category: 'Salads', price: '$8.50', available: true, description: 'Romaine, croutons, shaved parmesan, house Caesar dressing.' },
];

export const Menu = () => {
  const [items, setItems] = useState(initialMenu);

  const toggleAvailability = (id) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, available: !item.available } : item))
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>Menu & Catalog</h1>
          <p style={{ color: '#6b7280', fontSize: '0.875rem', margin: '4px 0 0' }}>
            Control live item availability, descriptions and retail prices
          </p>
        </div>

        <button
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 16px',
            borderRadius: '8px',
            background: '#2e7d32',
            color: '#fff',
            border: 'none',
            fontWeight: 700,
            fontSize: '0.85rem',
            cursor: 'pointer',
          }}
        >
          <Plus size={16} /> Add Item
        </button>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e8f0e3', borderRadius: '12px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ background: '#fafbfa', borderBottom: '1px solid #e8f0e3', color: '#6b7280' }}>
              <th style={{ padding: '12px 18px', fontWeight: 600 }}>Item</th>
              <th style={{ padding: '12px 18px', fontWeight: 600 }}>Category</th>
              <th style={{ padding: '12px 18px', fontWeight: 600 }}>Price</th>
              <th style={{ padding: '12px 18px', fontWeight: 600 }}>Availability</th>
              <th style={{ padding: '12px 18px', fontWeight: 600, textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr
                key={item.id}
                style={{
                  borderBottom: i < items.length - 1 ? '1px solid #f0f4ee' : 'none',
                  background: !item.available ? '#fafaf9' : 'transparent',
                }}
              >
                <td style={{ padding: '14px 18px' }}>
                  <div style={{ fontWeight: 700, color: item.available ? '#1a1a1a' : '#9ca3af' }}>{item.name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '2px' }}>{item.description}</div>
                </td>
                <td style={{ padding: '14px 18px', color: '#4b5563', fontWeight: 500 }}>{item.category}</td>
                <td style={{ padding: '14px 18px', fontWeight: 700 }}>{item.price}</td>
                <td style={{ padding: '14px 18px' }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '4px 8px',
                      borderRadius: '999px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      background: item.available ? '#eaf4ea' : '#fee2e2',
                      color: item.available ? '#166534' : '#991b1b',
                    }}
                  >
                    {item.available ? <Check size={12} /> : <X size={12} />}
                    {item.available ? 'In Stock' : 'Sold Out'}
                  </span>
                </td>
                <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                  <button
                    onClick={() => toggleAvailability(item.id)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '6px',
                      border: '1px solid #e8f0e3',
                      background: '#fff',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {item.available ? 'Mark Sold Out' : 'Mark Available'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Menu;
