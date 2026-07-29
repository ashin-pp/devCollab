export interface CreateNotificationRequestDto {
    userId: string;
    type: 'POLL_CREATED' | 'JOIN_REQUEST' | 'JOIN_REQUEST_APPROVED' | 'WORKSPACE_INVITE' | 'GENERAL' | 'WORKSPACE' | 'CHANNEL' | 'DIRECT_MESSAGE' | 'MENTION';
    title: string;
    message: string;
    relatedId?: string;
}
