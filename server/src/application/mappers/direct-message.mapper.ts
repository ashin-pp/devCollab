import { DirectMessage } from "../../domain/entities/direct-message.entity";
import { DirectMessageResponseDto } from "../dtos/dm/response/direct-message.response.dto";

export function toDirectMessageResponseDto(message: DirectMessage): DirectMessageResponseDto {
    return {
        id: message.id as string,
        conversationId: message.conversationId,
        senderId: message.senderId,
        content: message.content,
        isSeen: message.isSeen,
        messageType: message.messageType,
        imageUrl: message.imageUrl,
        isEdited: message.isEdited,
        createdAt: message.createdAt,
        updatedAt: message.updatedAt,
    };
}
