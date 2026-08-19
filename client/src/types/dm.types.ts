export interface ConversationOtherUser {
  id: string;
  name: string;
  profileImage?: string;
}

export interface Conversation {
  id: string;
  workspaceId: string;
  lastMessageAt?: string;
  lastMessage?: string;
  unreadCount?: number;
  createdAt?: string;
  otherUser: ConversationOtherUser;
}

export interface DirectMessage {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  isSeen: boolean;
  messageType: string;
  imageUrl?: string;
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
}
