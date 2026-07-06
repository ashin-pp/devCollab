export interface SendMessageRequestDto {
    workspaceId: string;
    channelId: string;
    senderId: string;
    content: string;
    messageType?: 'text' | 'image' | 'system';
    imageUrl?: string;
    mentionedUserIds?: string[];
}
