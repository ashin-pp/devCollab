import { inject, injectable } from 'tsyringe';
import type { IAIChatRepository } from "../../../application/interfaces/repositories/ai-chat.repository.interface";
import { AIChat } from "../../../domain/entities/ai-chat.entity";
import { AIAgentType } from "../../../domain/enums/AIAgentType";
import { ISaveAIChatUseCase } from "../../interfaces/use-cases/ai/save-ai-chat.usecase.interface";
import { REPOSITORY_TOKENS } from "../../../infrastructure/di/repository.tokens";

@injectable()
export class SaveAIChatUseCase implements ISaveAIChatUseCase {
    constructor(
        @inject(REPOSITORY_TOKENS.IAIChatRepository) private _aiChatRepository: IAIChatRepository
    ) {}

    async execute(userId: string, workspaceId: string, channelId: string, command: AIAgentType, prompt: string, response: string): Promise<void> {
        const newChat: Partial<AIChat> = {
            userId,
            workspaceId,
            channelId,
            command,
            prompt,
            response
        };

        await this._aiChatRepository.create(newChat);
    }
}
