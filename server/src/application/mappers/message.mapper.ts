import { Message } from "../../domain/entities/message.entity";
import { MessageResponseDto } from "../dtos/channel/response/message.response.dto";

export function toMessageResponseDto(message: Message): MessageResponseDto {
    return {
        id: message.id as string,
        workspaceId: message.workspaceId,
        channelId: message.channelId,
        senderId: message.senderId,
        content: message.content,
        messageType: message.messageType as MessageResponseDto["messageType"],
        senderName: message.senderName,
        imageUrl: message.imageUrl,
        parentMessageId: message.parentMessageId,
        threadRootId: message.threadRootId,
        replyVisibility: message.replyVisibility,
        visibleToUserId: message.visibleToUserId,
        isEdited: message.isEdited,
        isPinned: message.isPinned,
        replyCount: message.replyCount,
        createdAt: message.createdAt,
        updatedAt: message.updatedAt,
    };
}
