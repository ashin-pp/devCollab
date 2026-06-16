import { api } from '../axios';

export const ChannelService = {
    createChannel: (workspaceId: string, data: { name: string, description?: string, privacy?: 'public' | 'private' }) => {
        return api.post(`/workspaces/${workspaceId}/channels`, data);
    },
    getWorkspaceChannels: (workspaceId: string) => {
        return api.get(`/workspaces/${workspaceId}/channels`);
    }
};
