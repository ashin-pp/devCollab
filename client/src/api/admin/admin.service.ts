import { api } from "../axios";
import type { LoginData, ResetPasswordData } from "../../types/auth.types";

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
    },
    getWorkspaces: async () => {
        const response = await api.get('/admin/workspaces');
        return response.data;
    },
    toggleWorkspaceStatus: async (id: string, isActive: boolean) => {
        const response = await api.patch(`/admin/workspaces/${id}/status`, { isActive });
        return response.data;
    },
    getWorkspaceMembers: async (id: string) => {
        const response = await api.get(`/admin/workspaces/${id}/members`);
        return response.data;
    },
    updateWorkspaceMemberStatus: async (workspaceId: string, userId: string, status: string) => {
        const response = await api.patch(`/admin/workspaces/${workspaceId}/members/${userId}/status`, { status });
        return response.data;
    }
};
