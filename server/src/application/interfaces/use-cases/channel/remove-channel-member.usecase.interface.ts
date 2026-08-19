
export interface IRemoveChannelMemberUseCase {
    execute(payload: {workspaceId: string, channelId: string, targetUserId: string, requestUserId: string}): Promise<{ userId: string, userName: string, removedBy: string }>;
}
