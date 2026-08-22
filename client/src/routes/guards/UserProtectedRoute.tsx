import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../store';
import { useEffect } from 'react';
import { api } from '../../api/axios';
import { isAxiosError } from 'axios';
import { logout } from '../../store/slices/authSlice';
import { stashPendingInviteFromSearch } from '../../utils/pendingInvite';
import { IncomingCallListener } from '../../components/workspace/shared/IncomingCallListener';

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

    // Use Bearer /users/profile — not /auth/refresh.
    // Amplify (amplifyapp.com) → api.devcollab.space is cross-site; the refresh
    // cookie often is not sent, which used to log the user out on the login page.
    const checkStatus = async () => {
      try {
        await api.get('/users/profile');
      } catch (err: unknown) {
        if (!isAxiosError(err)) return;
        const msg = err.response?.data?.message || err.response?.data?.error?.message;
        if (msg === 'Blocked by Admin') {
          dispatch(logout());
          navigate('/login', { replace: true, state: { error: "Your account has been blocked by an Administrator." } });
        }
      }
    };
    
    checkStatus();
    const interval = setInterval(checkStatus, 15000);

    return () => clearInterval(interval);
  }, [dispatch, navigate, isAuthenticated, user]);

  if (!isAuthenticated || user?.role !== 'user') {
    return <Navigate to={`/login${location.search}`} replace state={{ from: location }} />;
  }

  return (
    <>
      <IncomingCallListener />
      <Outlet />
    </>
  );
};
