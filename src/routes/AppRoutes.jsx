import React, { Suspense, lazy, useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import merchantOnboardingService from '../services/merchantOnboardingService';
import MainLayout from '../components/layout/MainLayout';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { ROUTES, USER_ROLES } from '../utils/constants';

// Route-level code splitting via dynamic imports
const Login = lazy(() => import('../pages/Login/Login'));
const Register = lazy(() => import('../pages/Register/Register'));
const ResetPassword = lazy(() => import('../pages/ResetPassword/ResetPassword'));
const Dashboard = lazy(() => import('../pages/Dashboard/Dashboard'));
const Orders = lazy(() => import('../pages/Orders/Orders'));
const Menu = lazy(() => import('../pages/Menu/Menu'));
const Settings = lazy(() => import('../pages/Settings/Settings'));

/**
 * Enterprise Protected Route Wrapper
 * 1. Waits for session verification to complete.
 * 2. Verifies authentication status.
 * 3. Enforces Role-Based Access Control (RBAC).
 * 4. Ensures merchant is approved by admin; otherwise redirects to their active onboarding step.
 */
const ProtectedRoute = ({ children, requiredRole = USER_ROLES.MERCHANT }) => {
  const { isAuthenticated, isInitialized, user, loading } = useAuth();
  const location = useLocation();
  const [checkingApproval, setCheckingApproval] = useState(true);
  const [onboardingTarget, setOnboardingTarget] = useState(null);

  useEffect(() => {
    let isCancelled = false;

    const checkApproval = async () => {
      // Platform Admins bypass merchant onboarding restrictions
      if (!isAuthenticated || user?.role === USER_ROLES.ADMIN) {
        if (!isCancelled) setCheckingApproval(false);
        return;
      }

      try {
        const dest = await merchantOnboardingService.resolveDestination(ROUTES.DASHBOARD);
        if (dest && dest !== ROUTES.DASHBOARD && !dest.startsWith('/dashboard')) {
          if (!isCancelled) {
            setOnboardingTarget(dest);
          }
        }
      } catch (err) {
        console.warn('[ProtectedRoute] Merchant approval check failed:', err);
      } finally {
        if (!isCancelled) {
          setCheckingApproval(false);
        }
      }
    };

    if (isInitialized && !loading) {
      if (isAuthenticated) {
        checkApproval();
      } else {
        setCheckingApproval(false);
      }
    }

    return () => {
      isCancelled = true;
    };
  }, [isAuthenticated, isInitialized, loading, user?.role]);

  if (!isInitialized || loading || (isAuthenticated && checkingApproval && user?.role !== USER_ROLES.ADMIN)) {
    return <LoadingSpinner fullScreen message="Verifying merchant status..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  // If merchant has not yet been approved by admin, redirect to active onboarding step
  if (onboardingTarget) {
    return <Navigate to={onboardingTarget} replace />;
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
  const { isInitialized, checkSession } = useAuth();

  // On initial app mount, verify session against backend /auth/me
  useEffect(() => {
    if (!isInitialized) {
      checkSession();
    }
  }, [isInitialized]);

  if (!isInitialized) {
    return <LoadingSpinner fullScreen message="Initializing MEAX Portal..." />;
  }

  return (
    <Suspense fallback={<LoadingSpinner fullScreen message="Loading portal..." />}>
      <Routes>
        {/* Public Auth Routes */}
        <Route path={ROUTES.LOGIN} element={<Login />} />
        <Route path={ROUTES.REGISTER} element={<Register />} />
        <Route
          path="/become-merchant"
          element={<Navigate to={ROUTES.REGISTER} replace />}
        />
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
