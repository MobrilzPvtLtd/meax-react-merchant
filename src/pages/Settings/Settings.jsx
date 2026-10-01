import React, { useState } from 'react';
import useAuth from '../../hooks/useAuth';

export const Settings = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    storeName: user?.storeName || 'Lone Star Pizza & Pasta',
    email: user?.email || 'dana@lonestarpizza.com',
    phone: user?.phone || '+1 214-555-0199',
    address: user?.address || '1420 Elm St, Dallas, TX 75201',
    deliveryRadius: '8 miles',
    avgPrepTime: '15-20 min',
  });
  const [saved, setSaved] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setSaved(false);
  };

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '800px' }}>
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>Store Profile & Settings</h1>
        <p style={{ color: '#6b7280', fontSize: '0.875rem', margin: '4px 0 0' }}>
          Configure restaurant contact info, physical location and delivery preferences
        </p>
      </div>

      <form onSubmit={handleSave} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {saved && (
          <div style={{ padding: '10px 14px', borderRadius: '8px', background: '#ecfdf5', color: '#065f46', fontSize: '0.85rem', fontWeight: 600 }}>
            ✓ Settings successfully saved!
          </div>
        )}

        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
            Store / Business Name
          </label>
          <input
            name="storeName"
            value={formData.storeName}
            onChange={handleChange}
            style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.9rem' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
              Business Contact Email
            </label>
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.9rem' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
              Primary Phone
            </label>
            <input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.9rem' }}
            />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
            Store Street Address (Dallas-Fort Worth)
          </label>
          <input
            name="address"
            value={formData.address}
            onChange={handleChange}
            style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.9rem' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
              Delivery Radius
            </label>
            <input
              name="deliveryRadius"
              value={formData.deliveryRadius}
              onChange={handleChange}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.9rem' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
              Estimated Kitchen Prep Time
            </label>
            <input
              name="avgPrepTime"
              value={formData.avgPrepTime}
              onChange={handleChange}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.9rem' }}
            />
          </div>
        </div>

        <button
          type="submit"
          style={{
            alignSelf: 'flex-start',
            marginTop: '0.5rem',
            padding: '10px 20px',
            borderRadius: '8px',
            background: '#2e7d32',
            color: '#fff',
            border: 'none',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Save Changes
        </button>
      </form>
    </div>
  );
};

export default Settings;
