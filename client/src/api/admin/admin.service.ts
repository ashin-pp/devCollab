import { api } from "../axios";
import type { LoginData, ResetPasswordData } from "../auth/auth.service";

export const AdminService = {
    login: async (data: LoginData) => {
        const response = await api.post('/admin/login', data);
        return response.data;
    },
    logout: async () => {
        const response = await api.post('/admin/logout');
        return response.data;
    },
    refresh: async () => {
        const response = await api.get('/admin/refresh');
        return response.data;
    },
    forgotPassword: async (email: string) => {
        const response = await api.post('/admin/forgot-password', { email });
        return response.data;
    },
    verifyResetOtp: async (email: string, otp: string) => {
        const response = await api.post('/admin/verify-reset-otp', { email, otp });
        return response.data;
    },
    resetPassword: async (data: ResetPasswordData) => {
        const response = await api.post('/admin/reset-password', data);
        return response.data;
    },
    getUsers: async () => {
        const response = await api.get('/admin/users');
        return response.data;
    },
    toggleUserStatus: async (id: string, isBlocked: boolean) => {
        const response = await api.patch(`/admin/users/${id}/status`, { isBlocked });
        return response.data;
    }
};
