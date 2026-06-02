import { Routes, Route } from 'react-router-dom';
import { DashboardPage } from '../pages/user/DashboardPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { UserProtectedRoute } from './guards/UserProtectedRoute';

export const UserRoutes = () => {
  return (
    <Routes>
      <Route element={<UserProtectedRoute />}>
        <Route path="dashboard" element={<DashboardPage />} />
      </Route>
      
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};
