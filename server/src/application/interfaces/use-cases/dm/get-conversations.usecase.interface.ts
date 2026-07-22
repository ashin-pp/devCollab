import { ConversationResponseDto } from "../../../dtos/dm/response/conversation.response.dto";

export interface IGetConversationsUseCase {
    execute(workspaceId: string, userId: string): Promise<ConversationResponseDto[]>;
}
