import { Routes, Route } from 'react-router-dom';
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { OtpVerificationPage } from '../pages/auth/OtpVerificationPage';
import { ForgotPasswordPage } from '../pages/auth/ForgotPasswordPage';
import { VerifyOtpForgotPage } from '../pages/auth/VerifyOtpForgotPage';
import { ResetPasswordPage } from '../pages/auth/ResetPasswordPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { UserPublicRoute } from './guards/UserPublicRoute';

export const AuthRoutes = () => {
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
       
      // <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};
