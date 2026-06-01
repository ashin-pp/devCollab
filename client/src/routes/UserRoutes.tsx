import { Routes, Route } from 'react-router-dom';
import { DashboardPage } from '../pages/user/DashboardPage';
import { NotFoundPage } from '../pages/NotFoundPage';

export const UserRoutes = () => {
  return (
    <Routes>
      <Route path="dashboard" element={<DashboardPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};
