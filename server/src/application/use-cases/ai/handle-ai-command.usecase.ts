import { inject, injectable } from 'tsyringe';
import type { IAIService } from "../../../application/interfaces/services/ai.service.interface";
import type { IPlanEntitlementService } from "../../interfaces/services/plan-entitlement.service.interface";
import type { IWorkspaceRepository } from "../../interfaces/repositories/workspace.repository.interface";
import { AIAgentType } from "../../../domain/enums/AIAgentType";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";
import { HttpStatusCode } from "../../../domain/enums/HttpStatusCode";
import { AppError } from "../../../domain/errors/AppError";
import { IHandleAiCommandUseCase } from "../../interfaces/use-cases/ai/handle-ai-command.usecase.interface";
import type { ISaveAIChatUseCase } from "../../interfaces/use-cases/ai/save-ai-chat.usecase.interface";
import { REPOSITORY_TOKENS } from "../../../infrastructure/di/repository.tokens";
import { SERVICE_TOKENS } from "../../../infrastructure/di/service.tokens";
import { USECASE_TOKENS } from "../../../infrastructure/di/usecase.tokens";
import { logger } from "../../../infrastructure/di/container";

@injectable()
export class HandleAiCommandUseCase implements IHandleAiCommandUseCase {
    constructor(
        @inject(SERVICE_TOKENS.IAIService) private _aiService: IAIService,
        @inject(USECASE_TOKENS.ISaveAIChatUseCase) private _saveAIChatUseCase: ISaveAIChatUseCase,
        @inject(SERVICE_TOKENS.IPlanEntitlementService) private _planEntitlementService: IPlanEntitlementService,
        @inject(REPOSITORY_TOKENS.IWorkspaceRepository) private _workspaceRepository: IWorkspaceRepository
    ) { }

    private resolveCommand(input: string): AIAgentType {
        const match = input.trim().match(/^\/(summary|task|notify|remind|schedule|help|info)\b/i);
        if (!match) {
            return AIAgentType.INFO;
        }

        const command = match[1]?.toLowerCase() ?? 'info';
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
            case 'help':
            case 'info':
            default:
                return AIAgentType.INFO;
        }
    }

    async execute(input: string, workspaceId: string, channelId: string, userId: string): Promise<string> {
        await this._planEntitlementService.resolveForUserId(userId);

        const workspace = await this._workspaceRepository.findById(workspaceId);
        if (!workspace) {
            throw new AppError(ErrorMessage.WORKSPACE_NOT_FOUND, HttpStatusCode.NOT_FOUND);
        }

        const ownerEntitlement = await this._planEntitlementService.resolveForUserId(workspace.createdBy);
        if (ownerEntitlement.isExpired) {
            throw new AppError(ErrorMessage.SUBSCRIPTION_EXPIRED, HttpStatusCode.FORBIDDEN);
        }
        if (!ownerEntitlement.plan.aiAssistantEnabled) {
            throw new AppError(ErrorMessage.AI_ASSISTANT_DISABLED, HttpStatusCode.FORBIDDEN);
        }

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
