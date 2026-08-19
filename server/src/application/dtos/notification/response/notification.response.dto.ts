export interface NotificationResponseDto {
    id: string;
    userId: string;
    type: 'GENERAL' | 'WORKSPACE' | 'CHANNEL' | 'DIRECT_MESSAGE' | 'MENTION';
    title: string;
    message: string;
    isRead: boolean;
    relatedId?: string;
    createdAt?: Date;
    updatedAt?: Date;
}
