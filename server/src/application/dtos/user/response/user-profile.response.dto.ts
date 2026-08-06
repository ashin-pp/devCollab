export interface ProfilePlanSnapshotDto {
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

export interface UserProfileResponseDto {
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
    /** Effective plan (includes soft-deleted / starter fallback). */
    currentPlan?: ProfilePlanSnapshotDto | null;
}
