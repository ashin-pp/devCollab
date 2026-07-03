export interface Notification {
    id: string;
    userId: string;
    type: 'POLL_CREATED' | 'JOIN_REQUEST_APPROVED' | 'WORKSPACE_INVITE' | 'GENERAL';
    title: string;
    message: string;
    relatedId?: string;
    isRead: boolean;
    createdAt: string;
    updatedAt: string;
}
