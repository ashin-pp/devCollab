export interface CreateChannelRequestDto {
    workspaceId: string;
    name: string;
    description: string;
    createdBy: string;
    privacy: 'public' | 'private';
}
