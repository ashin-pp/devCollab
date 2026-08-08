import type { ReplyVisibilityType } from "../../../../domain/enums/ReplyVisibility";

export interface MessageResponseDto {
    id: string;
    workspaceId: string;
    channelId: string;
    senderId: string;
    content: string;
    messageType: 'text' | 'image' | 'system' | 'ai';
    senderName?: string;
    imageUrl?: string;
    parentMessageId?: string;
    threadRootId?: string;
    replyVisibility?: ReplyVisibilityType;
    visibleToUserId?: string;
    isEdited: boolean;
    isPinned: boolean;
    replyCount?: number;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface ThreadRepliesResponseDto {
    rootMessage: MessageResponseDto;
    replies: MessageResponseDto[];
}
