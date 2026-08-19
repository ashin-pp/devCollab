import { api } from '../axios';
import { API_ENDPOINTS } from '../../config/api.constants';
import type { SendChannelMessageRequest } from '../../types/channel.types';

export const MessageService = {
    sendMessage: (
        workspaceId: string,
        channelId: string,
        payload: SendChannelMessageRequest
    ) => {
        return api.post(
            `/workspaces/${workspaceId}/channels/${channelId}/messages`,
            payload
        );
    },
    getChannelMessages: (workspaceId: string, channelId: string, page: number = 1, limit: number = 50) => {
        return api.get(`${API_ENDPOINTS.CHANNELS.MESSAGES(workspaceId, channelId)}?page=${page}&limit=${limit}`);
    },
    getThreadReplies: (workspaceId: string, channelId: string, messageId: string) => {
        return api.get(API_ENDPOINTS.CHANNELS.THREAD(workspaceId, channelId, messageId));
    }
};
