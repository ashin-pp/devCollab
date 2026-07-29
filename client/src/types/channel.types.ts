export type ReplyVisibility = 'everyone' | 'author';
export type MessageType = 'text' | 'image' | 'system';

export interface MessageData {
  id: string;
  channelId: string;
  senderId: string;
  senderName?: string;
  senderImage?: string;
  content: string;
  messageType: MessageType;
  imageUrl?: string;
  parentMessageId?: string;
  threadRootId?: string;
  replyVisibility?: ReplyVisibility;
  visibleToUserId?: string;
  replyCount?: number;
  createdAt: string;
  [key: string]: unknown;
}

export interface SendChannelMessageRequest {
  content: string;
  messageType?: MessageType;
  imageUrl?: string;
  mentionedUserIds?: string[];
  parentMessageId?: string;
  replyVisibility?: ReplyVisibility;
}

export interface ThreadRepliesResponse {
  rootMessage: MessageData;
  replies: MessageData[];
}

export interface ChannelData {
  id: string;
  name: string;
  description?: string;
  privacy: 'public' | 'private';
  createdBy: string;
  isMember?: boolean;
  hasPendingRequest?: boolean;
  createdAt: string;
  isActive: boolean;
  workspaceId: string;
}

export interface ChannelMemberData {
  id: string;
  channelId: string;
  userId: string;
  addedBy: string;
  role: 'admin' | 'member';
  status?: 'pending' | 'approved' | 'rejected';
  user?: {
    id: string;
    name: string;
    email: string;
    profileImage?: string;
  };
}
