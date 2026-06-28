import { api } from '../axios';
import { API_ENDPOINTS } from '../../config/api.constants';

export const MessageService = {
    sendMessage: (workspaceId: string, channelId: string, content: string, messageType: 'text' | 'image' | 'system' = 'text', imageUrl?: string) => {
        return api.post(`/workspaces/${workspaceId}/channels/${channelId}/messages`, { content, messageType, imageUrl });
    },
    getChannelMessages: (workspaceId: string, channelId: string, page: number = 1, limit: number = 50) => {
        return api.get(`${API_ENDPOINTS.CHANNELS.MESSAGES(workspaceId, channelId)}?page=${page}&limit=${limit}`);
    }
};
