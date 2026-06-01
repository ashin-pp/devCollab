import { Routes, Route } from 'react-router-dom';
import { AdminLoginPage } from '../pages/admin/AdminLoginPage';
import { AdminForgotPasswordPage } from '../pages/admin/AdminForgotPasswordPage';
import { AdminVerifyOtpPage } from '../pages/admin/AdminVerifyOtpPage';
import { AdminResetPasswordPage } from '../pages/admin/AdminResetPasswordPage';
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage';
import { AdminUserManagementPage } from '../pages/admin/AdminUserManagementPage';
import { NotFoundPage } from '../pages/NotFoundPage';

export const AdminRoutes = () => {
  return (
    <Routes>
      <Route path="login" element={<AdminLoginPage />} />
      <Route path="forgot-password" element={<AdminForgotPasswordPage />} />
      <Route path="verify" element={<AdminVerifyOtpPage />} />
      <Route path="reset-password" element={<AdminResetPasswordPage />} />
      
      {/* Protected Admin Routes */}
      <Route path="dashboard" element={<AdminDashboardPage />} />
      <Route path="users" element={<AdminUserManagementPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};
