import type { ReplyVisibilityType } from "../../../../domain/enums/ReplyVisibility";

export interface SendMessageRequestDto {
    workspaceId: string;
    channelId: string;
    senderId: string;
    content: string;
    messageType?: 'text' | 'image' | 'system';
    imageUrl?: string;
    mentionedUserIds?: string[];
    parentMessageId?: string;
    replyVisibility?: ReplyVisibilityType;
}
