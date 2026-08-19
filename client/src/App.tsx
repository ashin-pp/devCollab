import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { AuthService } from './api/auth/auth.service';
import { AdminService } from './api/admin/admin.service';
import { setCredentials } from './store/slices/authSlice';
import { AppRoutes } from './routes/AppRoutes';
import { GoogleOAuthProvider } from '@react-oauth/google';
import './index.css';
import { Toaster } from 'react-hot-toast';
import {
  clearAdminSession,
  clearUserSession,
  hasAdminSession,
  hasUserSession,
} from './utils/sessionHint';

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

if (!googleClientId) {
  console.warn('VITE_GOOGLE_CLIENT_ID is not set — Google sign-in is disabled.');
}

function App() {
  const dispatch = useDispatch();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const isAdminRoute = window.location.pathname.startsWith('/admin');

      // Skip refresh for guests — avoids a guaranteed 401 (and red console noise).
      if (isAdminRoute ? !hasAdminSession() : !hasUserSession()) {
        setIsInitializing(false);
        return;
      }

      try {
        const response = isAdminRoute
          ? await AdminService.refresh()
          : await AuthService.refresh();

        if (response.success && response.data) {
          dispatch(setCredentials({
            user: response.data.user || response.data.admin,
            accessToken: response.data.accessToken
          }));
        }
      } catch {
        if (isAdminRoute) clearAdminSession();
        else clearUserSession();
      } finally {
        setIsInitializing(false);
      }
    };

    initializeAuth();
  }, [dispatch]);

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const app = (
    <>
      <Toaster position="top-right" />
      <AppRoutes />
    </>
  );

  // Empty clientId crashes Google's SDK (Uncaught _.Cd) and breaks /login.
  if (!googleClientId) {
    return app;
  }

  return <GoogleOAuthProvider clientId={googleClientId}>{app}</GoogleOAuthProvider>;
}

export default App;
