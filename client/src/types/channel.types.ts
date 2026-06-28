export interface MessageData {
  id: string;
  channelId: string;
  senderId: string;
  senderName?: string;
  senderImage?: string;
  content: string;
  messageType: 'text' | 'image' | 'system';
  imageUrl?: string;
  createdAt: string;
  [key: string]: unknown;
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
