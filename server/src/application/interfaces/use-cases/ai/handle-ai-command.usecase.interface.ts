
export interface IHandleAiCommandUseCase {
    execute(input: string, workspaceId: string, channelId: string, userId: string): Promise<string>;
}
