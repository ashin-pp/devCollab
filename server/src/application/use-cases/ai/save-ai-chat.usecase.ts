import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../infrastructure/di/tokens';
import type { IAIChatRepository } from "../../../application/interfaces/repositories/ai-chat.repository.interface";
import { AIChat } from "../../../domain/entities/ai-chat.entity";
import { AIAgentType } from "../../../domain/enums/AIAgentType";

@injectable()
export class SaveAIChatUseCase {
    constructor(
        @inject(TOKENS.IAIChatRepository) private _aiChatRepository: IAIChatRepository
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
