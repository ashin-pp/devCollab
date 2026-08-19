import { inject, injectable } from "tsyringe";
import type { IPlanRepository } from "../../interfaces/repositories/plan.repository.interface";
import { ITogglePlanStatusUseCase } from "../../interfaces/use-cases/plan/toggle-plan-status.usecase.interface";
import { PlanResponseDto } from "../../dtos/plan/response/plan.response.dto";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";
import { HttpStatusCode } from "../../../domain/enums/HttpStatusCode";
import { AppError } from "../../../domain/errors/AppError";
import { REPOSITORY_TOKENS } from "../../../infrastructure/di/repository.tokens";

@injectable()
export class TogglePlanStatusUseCase implements ITogglePlanStatusUseCase {
    constructor(
        @inject(REPOSITORY_TOKENS.IPlanRepository) private readonly _planRepository: IPlanRepository
    ) {}

    async execute(payload: { planId: string; isActive: boolean }): Promise<PlanResponseDto> {
        const existing = await this._planRepository.findById(payload.planId);
        if (!existing) {
            throw new AppError(ErrorMessage.PLAN_NOT_FOUND, HttpStatusCode.NOT_FOUND);
        }

        const updated = await this._planRepository.update(payload.planId, {
            isActive: payload.isActive,
        });

        if (!updated) {
            throw new AppError(ErrorMessage.PLAN_NOT_FOUND, HttpStatusCode.NOT_FOUND);
        }

        return {
            id: updated.id as string,
            name: updated.name,
            price: updated.price,
            currency: updated.currency,
            durationDays: updated.durationDays,
            maxWorkspaces: updated.maxWorkspaces,
            maxMembersPerWorkspace: updated.maxMembersPerWorkspace,
            messageRetentionDays: updated.messageRetentionDays,
            aiAssistantEnabled: updated.aiAssistantEnabled,
            videoCallsEnabled: updated.videoCallsEnabled,
            multiAiAgents: updated.multiAiAgents,
            pinBoardEnabled: updated.pinBoardEnabled,
            isActive: updated.isActive,
        };
    }
}
