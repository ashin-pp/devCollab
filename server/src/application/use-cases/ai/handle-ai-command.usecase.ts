import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../infrastructure/di/tokens';
import type { IAIService } from "../../../application/interfaces/services/ai.service.interface";
import { SaveAIChatUseCase } from "./save-ai-chat.usecase";
import { AIAgentType } from "../../../domain/enums/AIAgentType";

@injectable()
export class HandleAiCommandUseCase {
    constructor(
        @inject(TOKENS.IAIService) private _aiService: IAIService,
        @inject(SaveAIChatUseCase) private _saveAIChatUseCase: SaveAIChatUseCase
    ) { }

    async execute(input: string, workspaceId: string, channelId: string, userId: string): Promise<string> {
        const response = await this._aiService.processMessage(input, { workspaceId, channelId, userId });

        await this._saveAIChatUseCase.execute(userId, workspaceId, channelId, AIAgentType.INFO, input, response);

        return response;
    }
}
