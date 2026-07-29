import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../store';
import { useEffect } from 'react';
import { api } from '../../api/axios';
import { isAxiosError } from 'axios';
import { logout } from '../../store/slices/authSlice';
import { stashPendingInviteFromSearch } from '../../utils/pendingInvite';

export const UserProtectedRoute = () => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    stashPendingInviteFromSearch(location.search);
  }, [location.search]);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'user') return;

    // Check if the user is still active or has been blocked by admin
    const checkStatus = async () => {
      try {
        await api.get('/auth/refresh');
      } catch (err: unknown) {
        if (isAxiosError(err)) {
          if (err.response?.data?.message === 'Blocked by Admin' || err.response?.data?.error?.message === 'Blocked by Admin') {
            dispatch(logout());
            navigate('/login', { replace: true, state: { error: "Your account has been blocked by an Administrator." } });
            return;
          }
        }
        dispatch(logout());
        navigate('/login', { replace: true });
      }
    };
    
    // Check immediately on mount
    checkStatus();

    // Poll every 15 seconds to simulate real-time block checks
    const interval = setInterval(checkStatus, 15000);

    return () => clearInterval(interval);
  }, [dispatch, navigate, isAuthenticated, user]);

  if (!isAuthenticated || user?.role !== 'user') {
    return <Navigate to={`/login${location.search}`} replace state={{ from: location }} />;
  }

  return <Outlet />;
};
