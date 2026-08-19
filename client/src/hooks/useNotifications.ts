import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../store';
import { setNotifications, markAsRead, markAllAsRead, clearAllNotifications } from '../store/slices/notificationSlice';
import { NotificationService } from '../api/notification/notification.service';
import toast from 'react-hot-toast';

export const useNotifications = () => {
    const dispatch = useDispatch();
    const { notifications, unreadCount } = useSelector((state: RootState) => state.notifications);

    const fetchNotifications = useCallback(async () => {
        try {
            const response = await NotificationService.getNotifications();
            if (response.success) {
                dispatch(setNotifications(response.data));
            }
        } catch (error: any) {
            console.error('Failed to fetch notifications:', error);
        }
    }, [dispatch]);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    const handleMarkAsRead = async (id: string) => {
        try {
            const response = await NotificationService.markAsRead(id);
            if (response.success) {
                dispatch(markAsRead(id));
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to mark notification as read');
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            const response = await NotificationService.markAllAsRead();
            if (response.success) {
                dispatch(markAllAsRead());
                toast.success('All notifications marked as read');
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to mark all as read');
        }
    };

    const handleClearAllNotifications = async () => {
        try {
            const response = await NotificationService.clearAllNotifications();
            if (response.success) {
                dispatch(clearAllNotifications());
                toast.success('All notifications cleared');
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to clear notifications');
        }
    };

    return {
        notifications,
        unreadCount,
        markAsRead: handleMarkAsRead,
        markAllAsRead: handleMarkAllAsRead,
        clearAllNotifications: handleClearAllNotifications,
        fetchNotifications
    };
};
