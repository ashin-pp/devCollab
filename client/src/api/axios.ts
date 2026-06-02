import axios from 'axios';
import { store } from '../store';
import { setCredentials, logout } from '../store/slices/authSlice';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
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
