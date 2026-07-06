export interface AddChannelMemberRequestDto {
    workspaceId: string;
    channelId: string;
    userIds: string[];
    requestUserId: string;
}
