import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

export interface CreateWorkspaceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (workspace: Record<string, unknown>) => void;
}

export interface CreateChannelModalProps {
    isOpen: boolean;
    onClose: () => void;
    workspaceId: string;
    onSuccess: (channel: Record<string, unknown>) => void;
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
