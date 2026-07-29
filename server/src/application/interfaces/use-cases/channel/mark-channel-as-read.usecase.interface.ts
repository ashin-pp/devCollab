
export interface IMarkChannelAsReadUseCase {
    execute(payload: {channelId: string, userId: string, readUpto?: Date}): Promise<{success: boolean, message: string, statusCode: number}>;
}
