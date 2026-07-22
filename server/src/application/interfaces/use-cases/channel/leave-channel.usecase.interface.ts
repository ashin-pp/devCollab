
export interface ILeaveChannelUseCase {
    execute(payload: {workspaceId: string, channelId: string, requestUserId: string}): Promise<boolean>;
}
