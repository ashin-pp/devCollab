
export interface IMarkChannelAsReadUseCase {
    execute(payload: {channelId: string, userId: string}): Promise<{success: boolean, message: string, statusCode: number}>;
}
