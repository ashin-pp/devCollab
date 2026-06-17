import { api } from "../axios";
import { API_ENDPOINTS } from '../../config/api.constants';
import type { LoginData, ResetPasswordData } from "../../types/auth.types";

export const AdminService = {
    login: async (data: LoginData) => {
        const response = await api.post(API_ENDPOINTS.ADMIN.LOGIN, data);
        return response.data;
    },
    logout: async () => {
        const response = await api.post(API_ENDPOINTS.ADMIN.LOGOUT);
        return response.data;
    },
    refresh: async () => {
        const response = await api.get(API_ENDPOINTS.ADMIN.REFRESH);
        return response.data;
    },
    forgotPassword: async (email: string) => {
        const response = await api.post(API_ENDPOINTS.ADMIN.FORGOT_PASSWORD, { email });
        return response.data;
    },
    verifyResetOtp: async (email: string, otp: string) => {
        const response = await api.post(API_ENDPOINTS.ADMIN.VERIFY_RESET_OTP, { email, otp });
        return response.data;
    },
    resetPassword: async (data: ResetPasswordData) => {
        const response = await api.post(API_ENDPOINTS.ADMIN.RESET_PASSWORD, data);
        return response.data;
    },
    getUsers: async () => {
        const response = await api.get(API_ENDPOINTS.ADMIN.USERS);
        return response.data;
    },
    toggleUserStatus: async (id: string, isBlocked: boolean) => {
        const response = await api.patch(API_ENDPOINTS.ADMIN.USER_STATUS(id), { isBlocked });
        return response.data;
    },
    getWorkspaces: async () => {
        const response = await api.get(API_ENDPOINTS.ADMIN.WORKSPACES);
        return response.data;
    },
    toggleWorkspaceStatus: async (id: string, isActive: boolean) => {
        const response = await api.patch(API_ENDPOINTS.ADMIN.WORKSPACE_STATUS(id), { isActive });
        return response.data;
    },
    getWorkspaceMembers: async (id: string) => {
        const response = await api.get(API_ENDPOINTS.ADMIN.WORKSPACE_MEMBERS(id));
        return response.data;
    },
    updateWorkspaceMemberStatus: async (workspaceId: string, userId: string, status: string) => {
        const response = await api.patch(API_ENDPOINTS.ADMIN.WORKSPACE_MEMBER_STATUS(workspaceId, userId), { status });
        return response.data;
    }
};
