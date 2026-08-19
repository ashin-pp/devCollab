import { inject, injectable } from "tsyringe";
import type { IPlanRepository } from "../../interfaces/repositories/plan.repository.interface";
import { IDeletePlanUseCase } from "../../interfaces/use-cases/plan/delete-plan.usecase.interface";
import { PlanResponseDto } from "../../dtos/plan/response/plan.response.dto";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";
import { HttpStatusCode } from "../../../domain/enums/HttpStatusCode";
import { SubscriptionStatus } from "../../../domain/enums/SubscriptionStatus";
import { AppError } from "../../../domain/errors/AppError";
import { REPOSITORY_TOKENS } from "../../../infrastructure/di/repository.tokens";

@injectable()
export class DeletePlanUseCase implements IDeletePlanUseCase {
    constructor(
        @inject(REPOSITORY_TOKENS.IPlanRepository) private readonly _planRepository: IPlanRepository
    ) {}

    async execute(payload: { planId: string }): Promise<PlanResponseDto> {
        const existing = await this._planRepository.findById(payload.planId);
        if (!existing || !existing.isActive) {
            throw new AppError(ErrorMessage.PLAN_NOT_FOUND, HttpStatusCode.NOT_FOUND);
        }

        if (existing.name.toLowerCase().includes(SubscriptionStatus.STARTER)) {
            throw new AppError(ErrorMessage.CANNOT_DELETE_STARTER_PLAN, HttpStatusCode.BAD_REQUEST);
        }

        const updated = await this._planRepository.update(payload.planId, {
            isActive: false,
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
