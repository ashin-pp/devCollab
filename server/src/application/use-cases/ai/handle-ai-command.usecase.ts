import { USECASE_TOKENS } from "../../../infrastructure/di/usecase.tokens";
import { inject, injectable } from 'tsyringe';
import type { IAIService } from "../../../application/interfaces/services/ai.service.interface";
import { AIAgentType } from "../../../domain/enums/AIAgentType";
import { IHandleAiCommandUseCase } from "../../interfaces/use-cases/ai/handle-ai-command.usecase.interface";
import type { ISaveAIChatUseCase } from "../../interfaces/use-cases/ai/save-ai-chat.usecase.interface";
import { SERVICE_TOKENS } from "../../../infrastructure/di/service.tokens";

@injectable()
export class HandleAiCommandUseCase implements IHandleAiCommandUseCase {
    constructor(
        @inject(SERVICE_TOKENS.IAIService) private _aiService: IAIService,
        @inject(USECASE_TOKENS.ISaveAIChatUseCase) private _saveAIChatUseCase: ISaveAIChatUseCase
    ) { }

    async execute(input: string, workspaceId: string, channelId: string, userId: string): Promise<string> {
        const response = await this._aiService.processMessage(input, { workspaceId, channelId, userId });

        await this._saveAIChatUseCase.execute(userId, workspaceId, channelId, AIAgentType.INFO, input, response);

        return response;
    }
}
