import { injectable } from 'tsyringe';
import { IAIChatRepository } from "../../../application/interfaces/repositories/ai-chat.repository.interface";
import { AIChat } from "../../../domain/entities/ai-chat.entity";
import { AIChatModel } from "../models/ai-chat.model";

import { AIChatMapper } from "../mappers/ai-chat.mapper";

@injectable()
export class AIChatRepository implements IAIChatRepository {
    private _mapper: AIChatMapper;

    constructor() {
        this._mapper = new AIChatMapper();
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
        return this._mapper.toDomain(savedChat);
    }

    async findByChannel(channelId: string, limit: number = 50): Promise<AIChat[]> {
        const chats = await AIChatModel.find({ channel_id: channelId }).sort({ created_at: -1 }).limit(limit);
        return chats.map(c => this._mapper.toDomain(c));
    }
}
