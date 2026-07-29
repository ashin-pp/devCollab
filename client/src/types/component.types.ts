import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import type { MessageData, ReplyVisibility, ChannelData, ChannelMemberData } from './channel.types';
import type { User } from './auth.types';

export interface CreateWorkspaceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (workspace: Record<string, unknown>) => void;
    existingWorkspaceNames?: string[];
}

export interface CreateChannelModalProps {
    isOpen: boolean;
    onClose: () => void;
    workspaceId: string;
    onSuccess: (channel: Record<string, unknown>) => void;
    existingChannelNames?: string[];
}

export interface FeatureCardProps {
    Icon: LucideIcon;
    title: string;
    description: string;
}

export interface UserLayoutProps {
  children: ReactNode;
}

export interface WorkspaceLayoutProps {
  children: ReactNode;
}

export interface ChannelMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string;
  channelId: string;
  channelCreatorId?: string;
  channelPrivacy?: 'public' | 'private';
  onOpenAddMember: () => void;
  onMemberRemoved?: () => void;
}

export interface AddChannelMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string;
  channelId: string;
}

export interface ChannelSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string;
  channelId: string;
  initialName: string;
  initialDescription?: string;
  initialPrivacy?: 'public' | 'private';
  onChannelUpdated: () => void;
  onChannelDeleted: () => void;
}

export interface ChannelMessageListProps {
  messages: MessageData[];
  user: User | null;
  memberImagesMap: Record<string, string>;
  hasMoreMessages: boolean;
  isLoadingMessages: boolean;
  loadMoreMessages: () => void;
  totalMessages: number;
  setSelectedImage: (url: string) => void;
  onOpenThread?: (message: MessageData) => void;
  channelId?: string;
  initialUnreadCount?: number;
  onMarkAsRead?: (readUpto?: string) => void;
  scrollToBottomSignal?: number;
}

export interface ThreadMessageItemProps {
  msg: MessageData;
  user: User | null;
  memberImagesMap: Record<string, string>;
  setSelectedImage: (url: string) => void;
  compact?: boolean;
}

export interface ThreadSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  channelName?: string;
  rootMessage: MessageData | null;
  replies: MessageData[];
  loading: boolean;
  user: User | null;
  memberImagesMap: Record<string, string>;
  onSendReply: (content: string, replyVisibility: ReplyVisibility) => Promise<void>;
  setSelectedImage: (url: string) => void;
}

export interface ChannelHeaderProps {
  currentChannel: ChannelData | null;
  isChannelMember: boolean;
  user: User | null;
  pendingRequestsCount: number;
  workspaceId: string;
  channelId: string;
  channelMembers: ChannelMemberData[];
  isChannelDropdownOpen: boolean;
  setIsChannelDropdownOpen: (open: boolean) => void;
  setShowMembersSidebar: (show: boolean) => void;
  onCloseThread: () => void;
  setIsSettingsModalOpen: (open: boolean) => void;
  navigate: (path: string) => void;
  openAiDashboard: (tab: 'tasks' | 'reminders' | 'notifications' | 'schedule') => void;
}
