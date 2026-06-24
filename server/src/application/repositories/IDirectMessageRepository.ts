import { DirectMessage } from '../../domain/entities/DirectMessage';

export interface IDirectMessageRepository {
    create(message: DirectMessage): Promise<DirectMessage>;
    findByConversationId(conversationId: string, limit?: number, skip?: number): Promise<DirectMessage[]>;
    markAsSeen(conversationId: string, receiverId: string): Promise<void>;
}
