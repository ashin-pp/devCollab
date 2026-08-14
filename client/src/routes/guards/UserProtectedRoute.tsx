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
