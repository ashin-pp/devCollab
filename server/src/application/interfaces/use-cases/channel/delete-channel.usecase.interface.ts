
export interface IDeleteChannelUseCase {
    execute(payload: {workspaceId: string, channelId: string, requestUserId: string}): Promise<boolean>;
}
