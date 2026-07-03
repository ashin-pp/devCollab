export interface Notification {
    id?: string;
    userId: string;
    type: 'POLL_CREATED' | 'JOIN_REQUEST_APPROVED' | 'WORKSPACE_INVITE' | 'GENERAL';
    title: string;
    message: string;
    relatedId?: string; // e.g., workspaceId, pollId
    isRead: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}
