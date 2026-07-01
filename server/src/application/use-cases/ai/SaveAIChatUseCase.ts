import { IAIChatRepository } from "../../repositories/IAIChatRepository";
import { AIChat } from "../../../domain/entities/AIChat";
import { AIAgentType } from "../../../domain/enums/AIAgentType";

export class SaveAIChatUseCase {
    constructor(private aiChatRepository: IAIChatRepository) {}

    async execute(userId: string, workspaceId: string, channelId: string, command: AIAgentType, prompt: string, response: string): Promise<void> {
        const newChat: Partial<AIChat> = {
            userId,
            workspaceId,
            channelId,
            command,
            prompt,
            response
        };

        await this.aiChatRepository.create(newChat);
    }
}
