export interface CreateWorkspaceData {
    name: string;
    description?: string;
    logo?: string;
    privacy?: 'public' | 'private';
    maxMembers?: number;
}

export interface JoinWorkspaceData {
    inviteCode: string;
    isFromEmailLink?: boolean;
}

export interface WorkspaceData {
  id: string;
  name: string;
  description: string;
  logo?: string;
  privacy: 'public' | 'private';
  maxMembers?: number;
  createdBy: string;
  inviteCode?: string;
}

export interface MemberData {
  id: string;
  userId: string;
  workspaceId: string;
  role: string;
  status: string;
  joinedAt: string;
  userName?: string;
  userEmail?: string;
  user?: { 
    name: string; 
    email: string; 
    profileImage?: string;
    bio?: string;
    location?: string;
    phone?: string;
    website?: string;
    title?: string;
    githubUrl?: string;
    linkedinUrl?: string;
    twitterUrl?: string;
    // Also include the backend field names for compatibility
    github?: string;
    linkedin?: string;
    twitter?: string;
    skills?: string[];
  };
}

export interface Workspace {
  id: string;
  name: string;
  description?: string;
  logo?: string;
  privacy: 'public' | 'private';
  isActive: boolean;
  maxMembers: number;
  createdAt: string;
  createdBy: string;
  inviteCode?: string;
  memberCount: number;
  ownerName: string;
  ownerEmail: string;
  memberStatus?: string;
}

export interface WorkspaceMember {
  id: string;
  userId: string;
  role: string;
  status: string;
  joinedAt: string;
  userName: string;
  userEmail: string;
  userAvatar?: string | null;
}
