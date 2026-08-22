import axios from 'axios';
import { store } from '../store';
import { setCredentials, logout } from '../store/slices/authSlice';
import { getApiBaseUrl } from '../config/urls';
import { HttpStatusCode } from '../enums/HttpStatusCode';

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

/** Login/register 401 must surface as invalid credentials — never try refresh. */
const isAuthCredentialRequest = (url?: string) =>
  !!url &&
  (/\/auth\/(login|register|google|forgot-password|reset-password|send-otp|verify-otp|verify-reset-otp)(\?|$)/.test(
    url
  ) ||
    /\/admin\/(login|forgot-password|reset-password|verify-otp)(\?|$)/.test(url));

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Don't retry refresh itself — missing cookie on login/register is expected.
    if (
      error.response?.status === HttpStatusCode.UNAUTHORIZED &&
      originalRequest &&
      !originalRequest._retry &&
      !isRefreshRequest(originalRequest.url) &&
      !isAuthCredentialRequest(originalRequest.url)
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

      } catch {
        store.dispatch(logout());
        // Keep the original 401 (e.g. expired access), not refresh cookie noise
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);
