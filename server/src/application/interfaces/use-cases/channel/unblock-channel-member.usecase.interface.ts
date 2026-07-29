
export interface IUnblockChannelMemberUseCase {
    execute(payload: {workspaceId: string, channelId: string, memberId: string, requesterId: string}): Promise<void>;
}
