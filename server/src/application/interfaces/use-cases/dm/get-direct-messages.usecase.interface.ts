import { DirectMessageResponseDto } from "../../../dtos/dm/response/direct-message.response.dto";

export interface IGetDirectMessagesUseCase {
    execute(
        conversationId: string,
        userId: string,
        limit: number,
        skip: number
    ): Promise<DirectMessageResponseDto[]>;
}
