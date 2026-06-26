import { api } from '../axios';
import { API_ENDPOINTS } from '../../config/api.constants';

export const DMService = {
    startConversation: async (workspaceId: string, receiverId: string) => {
        return api.post(API_ENDPOINTS.DM.START_CONVERSATION(workspaceId), { receiverId });
    },

    getConversations: async (workspaceId: string) => {
        return api.get(API_ENDPOINTS.DM.CONVERSATIONS(workspaceId));
    },

    getMessages: async (conversationId: string, limit: number = 50, skip: number = 0) => {
        return api.get(API_ENDPOINTS.DM.MESSAGES(conversationId), { params: { limit, skip } });
    },

    sendMessage: async (conversationId: string, content: string, messageType: 'text' | 'image' = 'text', imageUrl?: string) => {
        return api.post(API_ENDPOINTS.DM.MESSAGES(conversationId), { content, messageType, imageUrl });
    },

    markAsSeen: async (conversationId: string) => {
        return api.post(API_ENDPOINTS.DM.MARK_SEEN(conversationId));
    }
};
