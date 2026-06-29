import { api } from "../axios";
import type { Notification } from '../../types/notification.types';

export const NotificationService = {
    getNotifications: async (): Promise<{ success: boolean; data: Notification[] }> => {
        const response = await api.get('/notifications');
        return response.data;
    },

    markAsRead: async (id: string): Promise<{ success: boolean }> => {
        const response = await api.put(`/notifications/${id}/read`);
        return response.data;
    },

    markAllAsRead: async (): Promise<{ success: boolean }> => {
        const response = await api.put('/notifications/mark-all-read');
        return response.data;
    }
};
