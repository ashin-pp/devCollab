import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';

export const AdminProtectedRoute = () => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  // If not logged in as admin, redirect to admin login
  if (!isAuthenticated || user?.role !== 'admin') {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
};
