import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';

export const AdminPublicRoute = () => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  // If already logged in as admin, prevent accessing admin login/auth pages
  if (isAuthenticated && user?.role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <Outlet />;
};
