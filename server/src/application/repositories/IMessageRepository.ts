import { Message } from "../../domain/entities/Message";

export interface IMessageRepository {
    create(message: Message): Promise<Message>;
    findById(id: string): Promise<Message | null>;
    findByChannelId(channelId: string, limit: number, skip: number): Promise<Message[]>;
    update(id: string, message: Partial<Message>): Promise<Message | null>;
    delete(id: string): Promise<boolean>;
    countUnreadMessages(channelId: string, lastReadAt: Date): Promise<number>;
    findUnreadMessages(channelId: string, lastReadAt: Date): Promise<Message[]>;
}
