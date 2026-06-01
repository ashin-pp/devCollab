import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { AuthService } from './api/auth/auth.service';
import { setCredentials } from './store/slices/authSlice';
import { AppRoutes } from './routes/AppRoutes';
import { GoogleOAuthProvider } from '@react-oauth/google';
import './index.css';
import { Toaster } from 'react-hot-toast';

function App() {
  const dispatch = useDispatch();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const response = await AuthService.refresh();
        if (response.success && response.data) {
          dispatch(setCredentials({
            user: response.data.user,
            accessToken: response.data.accessToken
          }));
        }
      } catch (error) {
        // Silent catch: if refresh fails (no cookie, expired), user stays logged out
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

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || "dummy-client-id"}>
      <Toaster position="top-right" />
      <AppRoutes />
    </GoogleOAuthProvider>
  );
}

export default App;
