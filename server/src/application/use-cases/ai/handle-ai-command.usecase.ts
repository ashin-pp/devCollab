import { USECASE_TOKENS } from "../../../infrastructure/di/usecase.tokens";
import { inject, injectable } from 'tsyringe';
import type { IAIService } from "../../../application/interfaces/services/ai.service.interface";
import { AIAgentType } from "../../../domain/enums/AIAgentType";
import { IHandleAiCommandUseCase } from "../../interfaces/use-cases/ai/handle-ai-command.usecase.interface";
import type { ISaveAIChatUseCase } from "../../interfaces/use-cases/ai/save-ai-chat.usecase.interface";
import { SERVICE_TOKENS } from "../../../infrastructure/di/service.tokens";
import { logger } from "../../../infrastructure/di/container";

@injectable()
export class HandleAiCommandUseCase implements IHandleAiCommandUseCase {
    constructor(
        @inject(SERVICE_TOKENS.IAIService) private _aiService: IAIService,
        @inject(USECASE_TOKENS.ISaveAIChatUseCase) private _saveAIChatUseCase: ISaveAIChatUseCase
    ) { }

    private resolveCommand(input: string): AIAgentType {
        const match = input.trim().match(/^\/(summary|task|notify|remind|schedule|fix|help|info)\b/i);
        if (!match) {
            return AIAgentType.INFO;
        }

        const command = match[1].toLowerCase();
        switch (command) {
            case 'summary':
                return AIAgentType.SUMMARY;
            case 'task':
                return AIAgentType.TASK;
            case 'notify':
                return AIAgentType.NOTIFY;
            case 'remind':
                return AIAgentType.REMIND;
            case 'schedule':
                return AIAgentType.SCHEDULE;
            case 'fix':
                return AIAgentType.FIX;
            case 'help':
            case 'info':
            default:
                return AIAgentType.INFO;
        }
    }

    async execute(input: string, workspaceId: string, channelId: string, userId: string): Promise<string> {
        const command = this.resolveCommand(input);
        const response = await this._aiService.processMessage(input, { workspaceId, channelId, userId });

        try {
            await this._saveAIChatUseCase.execute(userId, workspaceId, channelId, command, input, response);
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : String(error);
            logger.error(`Failed to persist AI chat (${command}): ${message}`);
        }

        return response;
    }
}
