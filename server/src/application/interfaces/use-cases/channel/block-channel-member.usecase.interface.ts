
export interface IBlockChannelMemberUseCase {
    execute(payload: {workspaceId: string, channelId: string, memberId: string, requesterId: string}): Promise<{ userId: string, userName: string, removedBy: string }>;
}
