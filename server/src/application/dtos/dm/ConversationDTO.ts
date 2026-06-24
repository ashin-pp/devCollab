export interface ConversationOtherUserDTO {
    id: string;
    name: string;
    profileImage?: string;
}

export interface ConversationDTO {
    id: string;
    workspaceId: string;
    lastMessageAt?: Date;
    createdAt?: Date;
    otherUser: ConversationOtherUserDTO;
}
