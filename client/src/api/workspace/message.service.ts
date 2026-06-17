import { api } from '../axios';
import { API_ENDPOINTS } from '../../config/api.constants';

export const MessageService = {
    sendMessage: (workspaceId: string, channelId: string, content: string) => {
        return api.post(API_ENDPOINTS.CHANNELS.MESSAGES(workspaceId, channelId), { content });
    },
    getChannelMessages: (workspaceId: string, channelId: string, page: number = 1, limit: number = 50) => {
        return api.get(`${API_ENDPOINTS.CHANNELS.MESSAGES(workspaceId, channelId)}?page=${page}&limit=${limit}`);
    }
};
