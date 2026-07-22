import { Conversation } from "../../../../domain/entities/conversation.entity";

export interface IStartConversationUseCase {
    execute(workspaceId: string, initiatorId: string, receiverId: string): Promise<Conversation>;
}
