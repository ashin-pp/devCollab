import { api } from "../axios";
import type { Notification } from '../../types/notification.types';

import { API_ENDPOINTS } from '../../config/api.constants';

export const NotificationService = {
    getNotifications: async (): Promise<{ success: boolean; data: Notification[] }> => {
        const response = await api.get(API_ENDPOINTS.NOTIFICATIONS.BASE);
        return response.data;
    },

    markAsRead: async (id: string): Promise<{ success: boolean }> => {
        const response = await api.put(API_ENDPOINTS.NOTIFICATIONS.MARK_READ(id));
        return response.data;
    },

    markAllAsRead: async (): Promise<{ success: boolean }> => {
        const response = await api.put(API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ);
        return response.data;
    },

    clearAllNotifications: async (): Promise<{ success: boolean }> => {
        const response = await api.delete(API_ENDPOINTS.NOTIFICATIONS.CLEAR_ALL);
        return response.data;
    }
};
