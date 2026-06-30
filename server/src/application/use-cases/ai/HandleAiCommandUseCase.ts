import { IAIService } from "../../../application/services/IAIService";

export class HandleAiCommandUseCase {
    constructor(private aiService: IAIService) {}

    async execute(input: string, workspaceId: string, channelId: string, userId: string): Promise<string> {
        // Here we pass the message to our AI Service. 
        // Later, we will add LangGraph here to route commands like @task or @summary.
        const response = await this.aiService.processMessage(input, { workspaceId, channelId, userId });
        return response;
    }
}
