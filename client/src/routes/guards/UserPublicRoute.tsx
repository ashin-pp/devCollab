import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';

export const UserPublicRoute = () => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  if (isAuthenticated) {
    if (user?.role === 'user') {
      return <Navigate to="/dashboard" replace />;
    }
    if (user?.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    }
  }

  return <Outlet />;
};
