import { api } from '../axios';

import type { CreateWorkspaceData, JoinWorkspaceData } from '../../types/workspace.types';

export const WorkspaceService = {
    createWorkspace: async (data: CreateWorkspaceData) => {
        const response = await api.post('/workspaces', data);
        return response.data;
    },

    joinWorkspace: async (data: JoinWorkspaceData) => {
        const response = await api.post('/workspaces/join', data);
        return response.data;
    },

    verifyInviteCode: async (code: string) => {
        const response = await api.get(`/workspaces/verify/${code}`);
        return response.data;
    },

    getUserWorkspaces: async () => {
        const response = await api.get('/workspaces/me');
        return response.data;
    },

    getPublicWorkspaces: async () => {
        const response = await api.get('/workspaces/public');
        return response.data;
    },

    getWorkspaceMembers: async (workspaceId: string, includeFullProfile = false) => {
        const params = includeFullProfile ? '?includeProfile=true' : '';
        const response = await api.get(`/workspaces/${workspaceId}/members${params}`);
        return response.data;
    },

    handleJoinRequest: async (workspaceId: string, targetUserId: string, action: 'approve' | 'reject') => {
        const response = await api.post(`/workspaces/${workspaceId}/requests`, { targetUserId, action });
        return response.data;
    },

    removeMember: async (workspaceId: string, targetUserId: string) => {
        const response = await api.delete(`/workspaces/${workspaceId}/members/${targetUserId}`);
        return response.data;
    },

    blockMember: async (workspaceId: string, targetUserId: string) => {
        const response = await api.patch(`/workspaces/${workspaceId}/members/${targetUserId}/block`);
        return response.data;
    },

    unblockMember: async (workspaceId: string, targetUserId: string) => {
        const response = await api.patch(`/workspaces/${workspaceId}/members/${targetUserId}/unblock`);
        return response.data;
    },

    updateWorkspace: async (workspaceId: string, data: Partial<CreateWorkspaceData>) => {
        const response = await api.put(`/workspaces/${workspaceId}`, data);
        return response.data;
    },

    regenerateInviteCode: async (workspaceId: string) => {
        const response = await api.patch(`/workspaces/${workspaceId}/invite-code`);
        return response.data;
    },

    deleteWorkspace: async (workspaceId: string) => {
        const response = await api.delete(`/workspaces/${workspaceId}`);
        return response.data;
    }
};
