import { Conversation } from '../../domain/entities/Conversation';

export interface IConversationRepository {
    create(conversation: Conversation): Promise<Conversation>;
    findById(id: string): Promise<Conversation | null>;
    findByParticipants(workspaceId: string, participant1Id: string, participant2Id: string): Promise<Conversation | null>;
    findByUser(workspaceId: string, userId: string): Promise<Conversation[]>;
    updateLastMessageTime(id: string, time: Date): Promise<void>;
}
