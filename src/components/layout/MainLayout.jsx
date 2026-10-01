import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';

/**
 * Main Shell Layout Component for Merchant Portal
 * Organizes Sidebar, Header, Page Outlet, and Footer.
 */
export const MainLayout = () => {
  return (
    <div className="app-container" style={{ display: 'flex', minHeight: '100vh', background: '#f7faf7' }}>
      <Sidebar />
      <div className="main-content" style={{ marginLeft: '220px', flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Header />
        <main style={{ flex: 1, padding: '2rem', maxWidth: '1400px', width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default MainLayout;
