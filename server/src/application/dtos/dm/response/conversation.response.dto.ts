export interface ConversationOtherUserResponseDto {
    id: string;
    name: string;
    profileImage?: string;
}

export interface ConversationResponseDto {
    id: string;
    workspaceId: string;
    lastMessageAt?: Date;
    lastMessage?: string;
    unreadCount?: number;
    createdAt?: Date;
    otherUser: ConversationOtherUserResponseDto;
}
