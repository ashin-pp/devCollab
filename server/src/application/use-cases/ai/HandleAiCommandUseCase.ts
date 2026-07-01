import { IAIService } from "../../../application/services/IAIService";
import { SaveAIChatUseCase } from "./SaveAIChatUseCase";
import { AIAgentType } from "../../../domain/enums/AIAgentType";

export class HandleAiCommandUseCase {
    constructor(
        private aiService: IAIService,
        private saveAIChatUseCase: SaveAIChatUseCase
    ) { }

    async execute(input: string, workspaceId: string, channelId: string, userId: string): Promise<string> {
        const response = await this.aiService.processMessage(input, { workspaceId, channelId, userId });

        await this.saveAIChatUseCase.execute(userId, workspaceId, channelId, AIAgentType.INFO, input, response);

        return response;
    }
}
