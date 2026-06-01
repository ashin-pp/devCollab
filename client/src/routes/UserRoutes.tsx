import { Routes, Route } from 'react-router-dom';
import { DashboardPage } from '../pages/user/DashboardPage';

export const UserRoutes = () => {
  return (
    <Routes>
      <Route path="dashboard" element={<DashboardPage />} />
    </Routes>
  );
};
