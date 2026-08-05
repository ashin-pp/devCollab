import { inject, injectable } from "tsyringe";
import type { IPlanRepository } from "../../interfaces/repositories/plan.repository.interface";
import { IUpdatePlanUseCase } from "../../interfaces/use-cases/plan/update-plan.usecase.interface";
import { UpdatePlanRequestDto } from "../../dtos/plan/request/update-plan.dto";
import { PlanResponseDto } from "../../dtos/plan/response/plan.response.dto";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";
import { HttpStatusCode } from "../../../domain/enums/HttpStatusCode";
import { AppError } from "../../../domain/errors/AppError";
import { REPOSITORY_TOKENS } from "../../../infrastructure/di/repository.tokens";

@injectable()
export class UpdatePlanUseCase implements IUpdatePlanUseCase {
    constructor(
        @inject(REPOSITORY_TOKENS.IPlanRepository) private readonly _planRepository: IPlanRepository
    ) {}

    async execute(payload: UpdatePlanRequestDto): Promise<PlanResponseDto> {
        if (!payload.planId || !payload.name?.trim() || payload.price == null || !payload.durationDays) {
            throw new AppError(ErrorMessage.MISSING_REQUIRED_FIELDS, HttpStatusCode.BAD_REQUEST);
        }

        if (
            !Number.isFinite(payload.maxWorkspaces) ||
            payload.maxWorkspaces < 1 ||
            !Number.isFinite(payload.maxMembersPerWorkspace) ||
            payload.maxMembersPerWorkspace < 1 ||
            !Number.isFinite(payload.messageRetentionDays) ||
            payload.messageRetentionDays < 1
        ) {
            throw new AppError(ErrorMessage.MISSING_REQUIRED_FIELDS, HttpStatusCode.BAD_REQUEST);
        }

        const existing = await this._planRepository.findById(payload.planId);
        if (!existing) {
            throw new AppError(ErrorMessage.PLAN_NOT_FOUND, HttpStatusCode.NOT_FOUND);
        }

        const updated = await this._planRepository.update(payload.planId, {
            name: payload.name.trim(),
            price: payload.price,
            currency: payload.currency || existing.currency || "INR",
            durationDays: payload.durationDays,
            maxWorkspaces: payload.maxWorkspaces,
            maxMembersPerWorkspace: payload.maxMembersPerWorkspace,
            messageRetentionDays: payload.messageRetentionDays,
            aiAssistantEnabled: payload.aiAssistantEnabled ?? existing.aiAssistantEnabled,
            videoCallsEnabled: payload.videoCallsEnabled ?? existing.videoCallsEnabled,
            multiAiAgents: payload.multiAiAgents ?? existing.multiAiAgents,
            pinBoardEnabled: payload.pinBoardEnabled ?? existing.pinBoardEnabled,
            isActive: payload.isActive ?? existing.isActive,
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
