import { MessageType } from "../../../../domain/enums/MessageType";

export interface DirectMessageResponseDto {
    id: string;
    conversationId: string;
    senderId: string;
    content: string;
    isSeen: boolean;
    messageType: MessageType;
    imageUrl?: string;
    isEdited: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}
