import { AIChat } from "../../../domain/entities/ai-chat.entity";

export interface IAIChatRepository {
    create(chat: Partial<AIChat>): Promise<AIChat>;
    findByChannel(channelId: string, limit?: number): Promise<AIChat[]>;
}
