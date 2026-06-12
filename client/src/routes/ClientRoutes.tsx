import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { OtpVerificationPage } from '../pages/auth/OtpVerificationPage';
import { ForgotPasswordPage } from '../pages/auth/ForgotPasswordPage';
import { VerifyOtpForgotPage } from '../pages/auth/VerifyOtpForgotPage';
import { ResetPasswordPage } from '../pages/auth/ResetPasswordPage';
import { UserPublicRoute } from './guards/UserPublicRoute';

import { DashboardPage } from '../pages/user/DashboardPage';
import { UserProtectedRoute } from './guards/UserProtectedRoute';
import { DummyChannelPage } from '../pages/workspace/DummyChannelPage';
import { ProfilePage } from '../pages/profile/ProfilePage';
import { EditProfilePage } from '../pages/profile/EditProfilePage';

export const ClientRoutes = () => {
  return (
    <Routes>
      <Route element={<UserPublicRoute />}>
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="verify" element={<OtpVerificationPage />} />
        <Route path="forgot-password" element={<ForgotPasswordPage />} />
        <Route path="verify-forgot" element={<VerifyOtpForgotPage />} />
        <Route path="reset-password" element={<ResetPasswordPage />} />
      </Route>

      <Route element={<UserProtectedRoute />}>
        <Route path="dashboard" element={<DashboardPage />} />
        
        {/* Workspace Routes */}
        <Route path="workspace/channels" element={<DummyChannelPage />} />
        <Route path="workspace/dm" element={<DummyChannelPage />} />
        <Route path="workspace/polls" element={<DummyChannelPage />} />
        <Route path="workspace/members" element={<DummyChannelPage />} />
        
        {/* Profile Routes */}
        <Route path="profile" element={<ProfilePage />} />
        <Route path="profile/edit" element={<EditProfilePage />} />
        
        {/* Redirect unknown protected routes to dashboard */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
};
