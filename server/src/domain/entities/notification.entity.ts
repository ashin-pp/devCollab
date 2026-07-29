export interface Notification {
    id?: string;
    userId: string;
    type: 'POLL_CREATED' | 'JOIN_REQUEST_APPROVED' | 'WORKSPACE_INVITE' | 'GENERAL' | 'WORKSPACE' | 'CHANNEL' | 'DIRECT_MESSAGE' | 'MENTION';
    title: string;
    message: string;
    relatedId?: string; // e.g., workspaceId, pollId
    isRead: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}
