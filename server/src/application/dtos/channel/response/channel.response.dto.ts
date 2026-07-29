export interface ChannelResponseDto {
    id: string;
    workspaceId: string;
    name: string;
    description?: string;
    privacy: 'public' | 'private';
    createdBy: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    isMember?: boolean;
    hasPendingRequest?: boolean;
}
