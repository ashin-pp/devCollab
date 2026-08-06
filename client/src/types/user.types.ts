export interface UpdateProfileData {
    name?: string;
    bio?: string;
    skills?: string[];
    github?: string;
    linkedin?: string;
    twitter?: string;
    profileImage?: string;
    location?: string;
    email?: string;
    title?: string;
}

export interface ChangePasswordData {
    currentPassword?: string;
    newPassword?: string;
}

export interface ProfilePlanSnapshot {
  id: string;
  name: string;
  price: number;
  currency: string;
  durationDays: number;
  maxWorkspaces: number;
  maxMembersPerWorkspace: number;
  messageRetentionDays: number;
  aiAssistantEnabled: boolean;
  videoCallsEnabled: boolean;
  multiAiAgents: boolean;
  pinBoardEnabled: boolean;
  isActive: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  profileImage?: string;
  bio?: string;
  skills: string[];
  github?: string;
  linkedin?: string;
  twitter?: string;
  location?: string;
  title?: string;
  planId?: string | null;
  planSelectedAt?: string | null;
  planExpiresAt?: string | null;
  isSubscriptionExpired?: boolean;
  subscriptionStatus?: string;
  currentPlan?: ProfilePlanSnapshot | null;
}
