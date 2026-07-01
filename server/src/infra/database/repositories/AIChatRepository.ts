import { IAIChatRepository } from "../../../application/repositories/IAIChatRepository";
import { AIChat } from "../../../domain/entities/AIChat";
import { AIChatModel } from "../models/AIChatModel";

import { AIChatMapper } from "../../mappers/AIChatMapper";

export class AIChatRepository implements IAIChatRepository {
    private mapper: AIChatMapper;

    constructor() {
        this.mapper = new AIChatMapper();
    }

    async create(chat: Partial<AIChat>): Promise<AIChat> {
        const createdChat = new AIChatModel({
            user_id: chat.userId,
            workspace_id: chat.workspaceId,
            channel_id: chat.channelId,
            command: chat.command,
            prompt: chat.prompt,
            response: chat.response
        });
        const savedChat = await createdChat.save();
        return this.mapper.toDomain(savedChat);
    }

    async findByChannel(channelId: string, limit: number = 50): Promise<AIChat[]> {
        const chats = await AIChatModel.find({ channel_id: channelId }).sort({ created_at: -1 }).limit(limit);
        return chats.map(c => this.mapper.toDomain(c));
    }
}
