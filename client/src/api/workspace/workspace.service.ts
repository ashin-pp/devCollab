import { api } from '../axios';
import { API_ENDPOINTS } from '../../config/api.constants';
import type { CreateWorkspaceData, JoinWorkspaceData } from '../../types/workspace.types';

export const WorkspaceService = {
    createWorkspace: async (data: CreateWorkspaceData) => {
        const response = await api.post(API_ENDPOINTS.WORKSPACES.BASE, data);
        return response.data;
    },

    joinWorkspace: async (data: JoinWorkspaceData) => {
        const response = await api.post(API_ENDPOINTS.WORKSPACES.JOIN, data);
        return response.data;
    },

    verifyInviteCode: async (code: string) => {
        const response = await api.get(API_ENDPOINTS.WORKSPACES.VERIFY(code));
        return response.data;
    },

    getUserWorkspaces: async () => {
        const response = await api.get(API_ENDPOINTS.WORKSPACES.ME);
        return response.data;
    },

    getPublicWorkspaces: async () => {
        const response = await api.get(API_ENDPOINTS.WORKSPACES.PUBLIC);
        return response.data;
    },

    getWorkspaceMembers: async (workspaceId: string, includeFullProfile = false) => {
        const params = includeFullProfile ? '?includeProfile=true' : '';
        const response = await api.get(`${API_ENDPOINTS.WORKSPACES.MEMBERS(workspaceId)}${params}`);
        return response.data;
    },

    handleJoinRequest: async (workspaceId: string, targetUserId: string, action: 'approve' | 'reject') => {
        const response = await api.post(API_ENDPOINTS.WORKSPACES.REQUESTS(workspaceId), { targetUserId, action });
        return response.data;
    },

    removeMember: async (workspaceId: string, targetUserId: string) => {
        const response = await api.delete(API_ENDPOINTS.WORKSPACES.MEMBER(workspaceId, targetUserId));
        return response.data;
    },

    blockMember: async (workspaceId: string, targetUserId: string) => {
        const response = await api.patch(API_ENDPOINTS.WORKSPACES.BLOCK_MEMBER(workspaceId, targetUserId));
        return response.data;
    },

    unblockMember: async (workspaceId: string, targetUserId: string) => {
        const response = await api.patch(API_ENDPOINTS.WORKSPACES.UNBLOCK_MEMBER(workspaceId, targetUserId));
        return response.data;
    },

    updateWorkspace: async (workspaceId: string, data: Partial<CreateWorkspaceData>) => {
        const response = await api.put(API_ENDPOINTS.WORKSPACES.DETAIL(workspaceId), data);
        return response.data;
    },

    regenerateInviteCode: async (workspaceId: string) => {
        const response = await api.patch(API_ENDPOINTS.WORKSPACES.INVITE_CODE(workspaceId));
        return response.data;
    },

    deleteWorkspace: async (workspaceId: string) => {
        const response = await api.delete(API_ENDPOINTS.WORKSPACES.DETAIL(workspaceId));
        return response.data;
    },

    sendInviteEmail: async (workspaceId: string, targetEmail: string) => {
        const response = await api.post(API_ENDPOINTS.WORKSPACES.SEND_INVITE(workspaceId), { targetEmail });
        return response.data;
    }
};
