import { api } from '../axios';

export const ChannelService = {
    createChannel: (workspaceId: string, data: { name: string, description?: string, privacy?: 'public' | 'private' }) => {
        return api.post(`/workspaces/${workspaceId}/channels`, data);
    },
    getWorkspaceChannels: (workspaceId: string) => {
        return api.get(`/workspaces/${workspaceId}/channels`);
    },
    updateChannel: (workspaceId: string, channelId: string, data: { name?: string, description?: string, privacy?: 'public' | 'private' }) => {
        return api.patch(`/workspaces/${workspaceId}/channels/${channelId}`, data);
    },
    deleteChannel: (workspaceId: string, channelId: string) => {
        return api.delete(`/workspaces/${workspaceId}/channels/${channelId}`);
    },
    getMembers: (workspaceId: string, channelId: string) => {
        return api.get(`/workspaces/${workspaceId}/channels/${channelId}/members`);
    },
    addMembers: (workspaceId: string, channelId: string, userIds: string[]) => {
        return api.post(`/workspaces/${workspaceId}/channels/${channelId}/members`, { userIds });
    },
    removeMember: (workspaceId: string, channelId: string, memberId: string) => {
        return api.delete(`/workspaces/${workspaceId}/channels/${channelId}/members/${memberId}`);
    },
    leaveChannel: (workspaceId: string, channelId: string) => {
        return api.post(`/workspaces/${workspaceId}/channels/${channelId}/leave`);
    },
    joinChannel: (workspaceId: string, channelId: string) => {
        return api.post(`/workspaces/${workspaceId}/channels/${channelId}/join`);
    },
    getRequests: (workspaceId: string, channelId: string) => {
        return api.get(`/workspaces/${workspaceId}/channels/${channelId}/requests`);
    },
    updateRequest: (workspaceId: string, channelId: string, userId: string, action: 'approve' | 'reject') => {
        return api.patch(`/workspaces/${workspaceId}/channels/${channelId}/requests/${userId}`, { action });
    },
    markAsRead: (workspaceId: string, channelId: string) => {
        return api.post(`/workspaces/${workspaceId}/channels/${channelId}/read`);
    },
    getUnreadCounts: (workspaceId: string) => {
        return api.get(`/workspaces/${workspaceId}/channels/unread-counts`);
    }
};
