export interface UpdateChannelDetailsRequestDto {
    workspaceId: string;
    channelId: string;
    requestUserId: string;
    updateData: {
        name?: string;
        description?: string;
        privacy?: 'public' | 'private';
        is_active?: boolean;
    };
}
