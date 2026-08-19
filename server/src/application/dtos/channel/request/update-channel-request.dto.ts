export interface UpdateChannelRequestDto {
    workspaceId: string;
    channelId: string;
    userId: string;
    action: 'approve' | 'reject';
    adminId: string;
}
