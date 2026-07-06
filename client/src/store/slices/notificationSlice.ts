import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Notification } from '../../types/notification.types';

interface NotificationState {
    notifications: Notification[];
    unreadCount: number;
}

const initialState: NotificationState = {
    notifications: [],
    unreadCount: 0,
};

const notificationSlice = createSlice({
    name: 'notifications',
    initialState,
    reducers: {
        setNotifications: (state, action: PayloadAction<Notification[]>) => {
            state.notifications = action.payload;
            state.unreadCount = action.payload.filter(n => !n.isRead).length;
        },
        addNotification: (state, action: PayloadAction<Notification>) => {
            state.notifications.unshift(action.payload);
            state.unreadCount += 1;
        },
        markAsRead: (state, action: PayloadAction<string>) => {
            const notification = state.notifications.find(n => n.id === action.payload);
            if (notification && !notification.isRead) {
                notification.isRead = true;
                state.unreadCount = Math.max(0, state.unreadCount - 1);
            }
        },
        markAllAsRead: (state) => {
            state.notifications.forEach(n => { n.isRead = true; });
            state.unreadCount = 0;
        },
        clearAllNotifications: (state) => {
            state.notifications = [];
            state.unreadCount = 0;
        }
    }
});

export const { setNotifications, addNotification, markAsRead, markAllAsRead, clearAllNotifications } = notificationSlice.actions;
export default notificationSlice.reducer;
