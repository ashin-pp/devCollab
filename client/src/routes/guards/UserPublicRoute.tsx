import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';

/**
 * Public auth pages. When credentials are set mid-flow (OTP/Google register/login),
 * do not force-redirect — those pages navigate themselves (e.g. onboarding).
 */
const SELF_NAVIGATING_PATHS = new Set(['/login', '/register', '/verify']);

export const UserPublicRoute = () => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const location = useLocation();

  if (isAuthenticated) {
    if (user?.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    }

    if (user?.role === 'user' && !SELF_NAVIGATING_PATHS.has(location.pathname)) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <Outlet />;
};
