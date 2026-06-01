import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LandingPage } from '../pages/LandingPage';
import { AuthRoutes } from './AuthRoutes';
import { AdminRoutes } from './AdminRoutes';
import { UserRoutes } from './UserRoutes';

export const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing Page Route */}
        <Route path="/" element={<LandingPage />} />
        
        {/* Module Sub-Routes */}
        <Route path="/auth/*" element={<AuthRoutes />} />
        <Route path="/admin/*" element={<AdminRoutes />} />
        <Route path="/user/*" element={<UserRoutes />} />
      </Routes>
    </BrowserRouter>
  );
};
