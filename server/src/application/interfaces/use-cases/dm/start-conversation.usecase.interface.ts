import { ConversationResponseDto } from "../../../dtos/dm/response/conversation.response.dto";

export interface IStartConversationUseCase {
    execute(
        workspaceId: string,
        initiatorId: string,
        receiverId: string
    ): Promise<ConversationResponseDto>;
}
