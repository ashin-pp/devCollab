import { api } from '../axios';
import { API_ENDPOINTS } from '../../config/api.constants';

export const ChannelService = {
    createChannel: (workspaceId: string, data: { name: string, description?: string, privacy?: 'public' | 'private' }) => {
        return api.post(API_ENDPOINTS.CHANNELS.LIST(workspaceId), data);
    },
    getWorkspaceChannels: (workspaceId: string) => {
        return api.get(API_ENDPOINTS.CHANNELS.LIST(workspaceId));
    },
    updateChannel: (workspaceId: string, channelId: string, data: { name?: string, description?: string, privacy?: 'public' | 'private', is_active?: boolean }) => {
        return api.patch(API_ENDPOINTS.CHANNELS.DETAIL(workspaceId, channelId), data);
    },
    deleteChannel: (workspaceId: string, channelId: string) => {
        return api.delete(API_ENDPOINTS.CHANNELS.DETAIL(workspaceId, channelId));
    },
    getMembers: (workspaceId: string, channelId: string) => {
        return api.get(API_ENDPOINTS.CHANNELS.MEMBERS(workspaceId, channelId));
    },
    addMembers: (workspaceId: string, channelId: string, userIds: string[]) => {
        return api.post(API_ENDPOINTS.CHANNELS.MEMBERS(workspaceId, channelId), { userIds });
    },
    removeMember: (workspaceId: string, channelId: string, memberId: string) => {
        return api.delete(API_ENDPOINTS.CHANNELS.MEMBER(workspaceId, channelId, memberId));
    },
    blockMember: (workspaceId: string, channelId: string, memberId: string) => {
        return api.patch(API_ENDPOINTS.CHANNELS.BLOCK_MEMBER(workspaceId, channelId, memberId));
    },
    unblockMember: (workspaceId: string, channelId: string, memberId: string) => {
        return api.patch(API_ENDPOINTS.CHANNELS.UNBLOCK_MEMBER(workspaceId, channelId, memberId));
    },
    getBlockedMembers: (workspaceId: string, channelId: string) => {
        return api.get(API_ENDPOINTS.CHANNELS.BLOCKED_MEMBERS(workspaceId, channelId));
    },
    leaveChannel: (workspaceId: string, channelId: string) => {
        return api.post(API_ENDPOINTS.CHANNELS.LEAVE(workspaceId, channelId));
    },
    joinChannel: (workspaceId: string, channelId: string) => {
        return api.post(API_ENDPOINTS.CHANNELS.JOIN(workspaceId, channelId));
    },
    getRequests: (workspaceId: string, channelId: string) => {
        return api.get(API_ENDPOINTS.CHANNELS.REQUESTS(workspaceId, channelId));
    },
    updateRequest: (workspaceId: string, channelId: string, userId: string, action: 'approve' | 'reject') => {
        return api.patch(API_ENDPOINTS.CHANNELS.REQUEST(workspaceId, channelId, userId), { action });
    },
    markAsRead: (workspaceId: string, channelId: string) => {
        return api.post(API_ENDPOINTS.CHANNELS.READ(workspaceId, channelId));
    },
    getUnreadCounts: (workspaceId: string) => {
        return api.get(API_ENDPOINTS.CHANNELS.UNREAD_COUNTS(workspaceId));
    }
};
