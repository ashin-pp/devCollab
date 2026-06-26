export interface ConversationOtherUserDTO {
    id: string;
    name: string;
    profileImage?: string;
}

export interface ConversationDTO {
    id: string;
    workspaceId: string;
    lastMessageAt?: Date;
    lastMessage?: string;
    unreadCount?: number;
    createdAt?: Date;
    otherUser: ConversationOtherUserDTO;
}
