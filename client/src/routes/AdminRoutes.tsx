import { Routes, Route } from 'react-router-dom';
import { AdminLoginPage } from '../pages/admin/AdminLoginPage';
import { AdminForgotPasswordPage } from '../pages/admin/AdminForgotPasswordPage';
import { AdminVerifyOtpPage } from '../pages/admin/AdminVerifyOtpPage';
import { AdminResetPasswordPage } from '../pages/admin/AdminResetPasswordPage';
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage';
import { AdminUserManagementPage } from '../pages/admin/AdminUserManagementPage';
import { AdminWorkspaceManagementPage } from '../pages/admin/AdminWorkspaceManagementPage';
import { AdminWorkspaceMembersPage } from '../pages/admin/AdminWorkspaceMembersPage';
import { AdminPlanManagementPage } from '../pages/admin/AdminPlanManagementPage';
import { AdminSalesReportPage } from '../pages/admin/AdminSalesReportPage';
import { AdminWalletPage } from '../pages/admin/AdminWalletPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { AdminPublicRoute } from './guards/AdminPublicRoute';
import { AdminProtectedRoute } from './guards/AdminProtectedRoute';

export const AdminRoutes = () => {
  return (
    <Routes>
      {/* Public Admin Routes */}
      <Route element={<AdminPublicRoute />}>
        <Route path="login" element={<AdminLoginPage />} />
        <Route path="forgot-password" element={<AdminForgotPasswordPage />} />
        <Route path="verify" element={<AdminVerifyOtpPage />} />
        <Route path="reset-password" element={<AdminResetPasswordPage />} />
      </Route>
      
      {/* Protected Admin Routes */}
      <Route element={<AdminProtectedRoute />}>
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="users" element={<AdminUserManagementPage />} />
        <Route path="workspaces" element={<AdminWorkspaceManagementPage />} />
        <Route path="workspaces/:workspaceId/members" element={<AdminWorkspaceMembersPage />} />
        <Route path="plans" element={<AdminPlanManagementPage />} />
        <Route path="sales" element={<AdminSalesReportPage />} />
        <Route path="wallet" element={<AdminWalletPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};
