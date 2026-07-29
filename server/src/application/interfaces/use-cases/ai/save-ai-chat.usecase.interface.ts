import { AIAgentType } from "../../../../domain/enums/AIAgentType";

export interface ISaveAIChatUseCase {
    execute(userId: string, workspaceId: string, channelId: string, command: AIAgentType, prompt: string, response: string): Promise<void>;
}
