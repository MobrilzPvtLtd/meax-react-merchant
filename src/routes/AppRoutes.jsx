import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import MainLayout from '../components/layout/MainLayout';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { ROUTES, USER_ROLES } from '../utils/constants';

// Route-level code splitting via dynamic imports
const Login = lazy(() => import('../pages/Login/Login'));
const ResetPassword = lazy(() => import('../pages/ResetPassword/ResetPassword'));
const Dashboard = lazy(() => import('../pages/Dashboard/Dashboard'));
const Orders = lazy(() => import('../pages/Orders/Orders'));
const Menu = lazy(() => import('../pages/Menu/Menu'));
const Settings = lazy(() => import('../pages/Settings/Settings'));

/**
 * Enterprise Protected Route Wrapper
 * 1. Verifies authentication status.
 * 2. Enforces Role-Based Access Control (RBAC).
 * 3. Preserves requested location to seamlessly redirect after login.
 */
const ProtectedRoute = ({ children, requiredRole = USER_ROLES.MERCHANT }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner fullScreen message="Authenticating merchant..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  // RBAC validation: allow merchants and platform admins
  if (
    requiredRole &&
    user?.role &&
    user.role !== requiredRole &&
    user.role !== USER_ROLES.ADMIN
  ) {
    console.warn(`[ProtectedRoute] Access forbidden for role: ${user.role}`);
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return children;
};

/**
 * Central Merchant Routing Configuration
 */
export const AppRoutes = () => {
  return (
    <Suspense fallback={<LoadingSpinner fullScreen message="Loading portal..." />}>
      <Routes>
        {/* Public Auth Routes */}
        <Route path={ROUTES.LOGIN} element={<Login />} />
        <Route path={ROUTES.RESET_PASSWORD} element={<ResetPassword />} />
        <Route
          path={ROUTES.FORGOT_PASSWORD}
          element={<Navigate to={ROUTES.RESET_PASSWORD} replace />}
        />

        {/* Authenticated Application Shell */}
        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
          <Route path={ROUTES.ORDERS} element={<Orders />} />
          <Route path={ROUTES.MENU} element={<Menu />} />
          <Route path={ROUTES.SETTINGS} element={<Settings />} />
          <Route path={ROUTES.ACCOUNT} element={<Navigate to={ROUTES.SETTINGS} replace />} />
          <Route path="/earnings" element={<Dashboard />} />
          <Route path="/reviews" element={<Dashboard />} />
          <Route path={ROUTES.HOME} element={<Navigate to={ROUTES.DASHBOARD} replace />} />
        </Route>

        {/* Wildcard Fallback */}
        <Route path={ROUTES.NOT_FOUND} element={<Navigate to={ROUTES.DASHBOARD} replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
