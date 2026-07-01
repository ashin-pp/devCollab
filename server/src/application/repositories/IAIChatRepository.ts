import { AIChat } from "../../domain/entities/AIChat";

export interface IAIChatRepository {
    create(chat: Partial<AIChat>): Promise<AIChat>;
    findByChannel(channelId: string, limit?: number): Promise<AIChat[]>;
}
