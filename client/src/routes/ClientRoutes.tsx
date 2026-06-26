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
import { WorkspaceDashboardPage } from '../pages/workspace/WorkspaceDashboardPage';
import { DMChatPage } from '../pages/workspace/DMChatPage';
import { DummyChannelPage } from '../pages/workspace/DummyChannelPage';
import { WorkspaceMembersPage } from '../pages/workspace/WorkspaceMembersPage';
import { WorkspaceSettingsPage } from '../pages/workspace/WorkspaceSettingsPage';
import { WorkspaceChannelPage } from '../pages/workspace/WorkspaceChannelPage';
import { MemberProfilePage } from '../pages/workspace/MemberProfilePage';
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
        <Route path="workspace/:workspaceId" element={<Navigate to="dashboard" replace />} />
        <Route path="workspace/:workspaceId/dashboard" element={<WorkspaceDashboardPage />} />
        <Route path="workspace/:workspaceId/channels/:channelId" element={<WorkspaceChannelPage />} />
        <Route path="workspace/:workspaceId/channels" element={<WorkspaceChannelPage />} />
        <Route path="workspace/:workspaceId/dm" element={<DMChatPage />} />
        <Route path="workspace/:workspaceId/dm/:conversationId" element={<DMChatPage />} />
        <Route path="workspace/:workspaceId/polls" element={<DummyChannelPage />} />
        <Route path="workspace/:workspaceId/members" element={<WorkspaceMembersPage />} />
        <Route path="workspace/:workspaceId/members/:userId/profile" element={<MemberProfilePage />} />
        <Route path="workspace/:workspaceId/settings" element={<WorkspaceSettingsPage />} />

        {/* Profile Routes */}
        <Route path="profile" element={<ProfilePage />} />
        <Route path="profile/edit" element={<EditProfilePage />} />

        {/* Redirect unknown protected routes to dashboard */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
};
