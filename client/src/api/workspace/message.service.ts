import { api } from '../axios';

export const MessageService = {
    sendMessage: (workspaceId: string, channelId: string, content: string) => {
        return api.post(`/workspaces/${workspaceId}/channels/${channelId}/messages`, { content });
    },
    getChannelMessages: (workspaceId: string, channelId: string, page: number = 1, limit: number = 50) => {
        return api.get(`/workspaces/${workspaceId}/channels/${channelId}/messages?page=${page}&limit=${limit}`);
    }
};
