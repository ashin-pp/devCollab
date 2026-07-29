import { Message } from "../../../domain/entities/message.entity";

export interface IMessageRepository {
    create(message: Message): Promise<Message>;
    findById(id: string): Promise<Message | null>;
    findByChannelId(channelId: string, limit: number, skip: number): Promise<Message[]>;
    findThreadReplies(threadRootId: string, viewerId: string): Promise<Message[]>;
    countVisibleRepliesByRootIds(rootIds: string[], viewerId: string): Promise<Record<string, number>>;
    update(id: string, message: Partial<Message>): Promise<Message | null>;
    delete(id: string): Promise<boolean>;
    countUnreadMessages(channelId: string, lastReadAt: Date): Promise<number>;
    findUnreadMessages(channelId: string, lastReadAt: Date): Promise<Message[]>;
}
