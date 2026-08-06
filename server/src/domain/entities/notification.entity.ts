export interface Notification {
    id?: string;
    userId: string;
    type: 'POLL_CREATED' | 'JOIN_REQUEST' | 'JOIN_REQUEST_APPROVED' | 'WORKSPACE_INVITE' | 'GENERAL' | 'WORKSPACE' | 'CHANNEL' | 'DIRECT_MESSAGE' | 'MENTION' | 'AI_NOTIFY';
    title: string;
    message: string;
    relatedId?: string; // e.g., workspaceId, pollId
    /** Sender / actor for AI_NOTIFY (and similar) */
    actorId?: string;
    isRead: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}
