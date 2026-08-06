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
    getUsers: async (params?: { page: number; limit: number; search?: string; filter?: string; sortBy?: string; sortOrder?: string }) => {
        const response = await api.get(API_ENDPOINTS.ADMIN.USERS, { params });
        return response.data;
    },
    toggleUserStatus: async (id: string, isBlocked: boolean) => {
        const response = await api.patch(API_ENDPOINTS.ADMIN.USER_STATUS(id), { isBlocked });
        return response.data;
    },
    getWorkspaces: async (params?: { page: number; limit: number; search?: string; filter?: string; sortBy?: string; sortOrder?: string }) => {
        const response = await api.get(API_ENDPOINTS.ADMIN.WORKSPACES, { params });
        return response.data;
    },
    toggleWorkspaceStatus: async (id: string, isActive: boolean) => {
        const response = await api.patch(API_ENDPOINTS.ADMIN.WORKSPACE_STATUS(id), { isActive });
        return response.data;
    },
    getWorkspaceMembers: async (id: string, params?: { page: number; limit: number; search?: string; filter?: string; sortBy?: string; sortOrder?: string }) => {
        const response = await api.get(API_ENDPOINTS.ADMIN.WORKSPACE_MEMBERS(id), { params });
        return response.data;
    },
    updateWorkspaceMemberStatus: async (workspaceId: string, userId: string, status: string) => {
        const response = await api.patch(API_ENDPOINTS.ADMIN.WORKSPACE_MEMBER_STATUS(workspaceId, userId), { status });
        return response.data;
    },
    getPlans: async () => {
        const response = await api.get(API_ENDPOINTS.ADMIN.PLANS);
        return response.data;
    },
    createPlan: async (data: {
        name: string;
        price: number;
        currency?: string;
        durationDays: number;
        maxWorkspaces: number;
        maxMembersPerWorkspace: number;
        messageRetentionDays: number;
        aiAssistantEnabled?: boolean;
        videoCallsEnabled?: boolean;
        multiAiAgents?: boolean;
        pinBoardEnabled?: boolean;
        isActive?: boolean;
    }) => {
        const response = await api.post(API_ENDPOINTS.ADMIN.PLANS, data);
        return response.data;
    },
    updatePlan: async (
        id: string,
        data: {
            name: string;
            price: number;
            currency?: string;
            durationDays: number;
            maxWorkspaces: number;
            maxMembersPerWorkspace: number;
            messageRetentionDays: number;
            aiAssistantEnabled?: boolean;
            videoCallsEnabled?: boolean;
            multiAiAgents?: boolean;
            pinBoardEnabled?: boolean;
            isActive?: boolean;
        }
    ) => {
        const response = await api.put(API_ENDPOINTS.ADMIN.PLAN_DETAIL(id), data);
        return response.data;
    },
    deletePlan: async (id: string) => {
        const response = await api.delete(API_ENDPOINTS.ADMIN.PLAN_DETAIL(id));
        return response.data;
    },
    getDashboardStats: async (params?: { days?: number; from?: string; to?: string }) => {
        const response = await api.get(API_ENDPOINTS.ADMIN.DASHBOARD, { params });
        return response.data;
    },
    getSalesReport: async (params?: {
        page?: number;
        limit?: number;
        status?: string;
        planName?: string;
        from?: string;
        to?: string;
    }) => {
        const response = await api.get(API_ENDPOINTS.ADMIN.SALES, { params });
        return response.data;
    },
    getWallet: async (params?: { page?: number; limit?: number }) => {
        const response = await api.get(API_ENDPOINTS.ADMIN.WALLET, { params });
        return response.data;
    },
};
