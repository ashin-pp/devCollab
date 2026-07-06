import { DirectMessage } from '../../../domain/entities/direct-message.entity';

export interface IDirectMessageRepository {
        create(message: DirectMessage): Promise<DirectMessage>;
        findByConversationId(conversationId: string, limit?: number, skip?: number): Promise<DirectMessage[]>;
        markAsSeen(conversationId: string, receiverId: string): Promise<void>;
        findLastMessageByConversationId(conversationId: string): Promise<DirectMessage | null>;
        countUnreadMessages(conversationId: string, receiverId: string): Promise<number>;
}