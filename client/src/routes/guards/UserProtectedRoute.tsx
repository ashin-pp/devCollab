import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';

export const UserProtectedRoute = () => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  if (!isAuthenticated || user?.role !== 'user') {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
