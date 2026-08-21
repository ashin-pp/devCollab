import axios from 'axios';
import { store } from '../store';
import { setCredentials, logout } from '../store/slices/authSlice';
import { getApiBaseUrl } from '../config/urls';

const BASE_URL = getApiBaseUrl();

export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const token = store.getState().auth.accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const isRefreshRequest = (url?: string) =>
  !!url && (url.includes('/auth/refresh') || url.includes('/admin/refresh'));

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Don't retry refresh itself — missing cookie on login/register is expected.
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isRefreshRequest(originalRequest.url)
    ) {
      originalRequest._retry = true;

      try {
        const isAdminRequest = originalRequest.url?.includes('/admin/');
        const refreshUrl = isAdminRequest ? `${BASE_URL}/admin/refresh` : `${BASE_URL}/auth/refresh`;
        
        const response = await axios.get(
          refreshUrl,
          { withCredentials: true }
        );

        const { accessToken, user, admin } = response.data.data;
        
        const entity = user || admin;

        store.dispatch(setCredentials({ accessToken, user: entity }));

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);

      } catch (refreshError) {
        store.dispatch(logout());
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
