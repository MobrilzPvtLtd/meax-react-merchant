import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  selectAuth,
  selectCurrentUser,
  selectIsAuthenticated,
  selectIsAuthInitialized,
  selectAuthLoading,
  selectAuthError,
  setLoading,
  setInitialized,
  loginSuccess,
  loginFailure,
  logout as logoutAction,
  updateUserProfile,
  clearError,
} from '../store/authSlice';
import authService from '../services/authService';
import { ROUTES } from '../utils/constants';

export const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const auth = useSelector(selectAuth);
  const user = useSelector(selectCurrentUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isInitialized = useSelector(selectIsAuthInitialized);
  const loading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);

  /**
   * Check active session against backend /auth/me on app load
   */
  const checkSession = async () => {
    try {
      const userProfile = await authService.getProfile();
      dispatch(loginSuccess({ user: userProfile }));
      return userProfile;
    } catch {
      dispatch(setInitialized(true));
      return null;
    }
  };

  /**
   * Log in merchant with credentials (HttpOnly cookies set by server)
   */
  const login = async (credentials, redirectTo) => {
    dispatch(setLoading(true));
    dispatch(clearError());
    try {
      const data = await authService.login(credentials);
      dispatch(loginSuccess(data));
      const target = redirectTo || location.state?.from?.pathname || ROUTES.DASHBOARD;
      navigate(target, { replace: true });
      return data;
    } catch (err) {
      const message = err.message || 'Authentication failed. Please check credentials.';
      dispatch(loginFailure(message));
      throw err;
    }
  };

  /**
   * Log out and clear server cookies + local state
   */
  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      dispatch(logoutAction());
      navigate(ROUTES.LOGIN, { replace: true });
    }
  };

  const updateProfile = (profileData) => {
    dispatch(updateUserProfile(profileData));
  };

  return {
    ...auth,
    user,
    isAuthenticated,
    isInitialized,
    loading,
    error,
    checkSession,
    login,
    logout,
    updateProfile,
  };
};

export default useAuth;
