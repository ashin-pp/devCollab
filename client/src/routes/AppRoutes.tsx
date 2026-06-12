import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LandingPage } from '../pages/LandingPage';
import { AdminRoutes } from './AdminRoutes';
import { ClientRoutes } from './ClientRoutes';

export const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing Page Route */}
        <Route path="/" element={<LandingPage />} />
        
        {/* Admin Sub-Routes */}
        <Route path="/admin/*" element={<AdminRoutes />} />
        
        {/* Client Sub-Routes (Auth & User) */}
        <Route path="/*" element={<ClientRoutes />} />
      </Routes>
    </BrowserRouter>
  );
};
