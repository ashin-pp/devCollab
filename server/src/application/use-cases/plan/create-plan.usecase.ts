import { inject, injectable } from "tsyringe";
import type { IPlanRepository } from "../../interfaces/repositories/plan.repository.interface";
import { ICreatePlanUseCase } from "../../interfaces/use-cases/plan/create-plan.usecase.interface";
import { CreatePlanRequestDto } from "../../dtos/plan/request/create-plan.dto";
import { PlanResponseDto } from "../../dtos/plan/response/plan.response.dto";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";
import { HttpStatusCode } from "../../../domain/enums/HttpStatusCode";
import { AppError } from "../../../domain/errors/AppError";
import { REPOSITORY_TOKENS } from "../../../infrastructure/di/repository.tokens";

@injectable()
export class CreatePlanUseCase implements ICreatePlanUseCase {
    constructor(
        @inject(REPOSITORY_TOKENS.IPlanRepository) private readonly _planRepository: IPlanRepository
    ) {}

    async execute(payload: CreatePlanRequestDto & { createdBy: string }): Promise<PlanResponseDto> {
        if (!payload.createdBy) {
            throw new AppError(ErrorMessage.UNAUTHORIZED, HttpStatusCode.UNAUTHORIZED);
        }

        const plan = await this._planRepository.create({
            name: payload.name.trim(),
            price: payload.price,
            currency: payload.currency || "INR",
            durationDays: payload.durationDays,
            maxWorkspaces: payload.maxWorkspaces,
            maxMembersPerWorkspace: payload.maxMembersPerWorkspace,
            messageRetentionDays: payload.messageRetentionDays,
            aiAssistantEnabled: payload.aiAssistantEnabled ?? false,
            videoCallsEnabled: payload.videoCallsEnabled ?? false,
            multiAiAgents: payload.multiAiAgents ?? false,
            pinBoardEnabled: payload.pinBoardEnabled ?? false,
            createdBy: payload.createdBy,
            isActive: payload.isActive ?? true,
        });

        return {
            id: plan.id as string,
            name: plan.name,
            price: plan.price,
            currency: plan.currency,
            durationDays: plan.durationDays,
            maxWorkspaces: plan.maxWorkspaces,
            maxMembersPerWorkspace: plan.maxMembersPerWorkspace,
            messageRetentionDays: plan.messageRetentionDays,
            aiAssistantEnabled: plan.aiAssistantEnabled,
            videoCallsEnabled: plan.videoCallsEnabled,
            multiAiAgents: plan.multiAiAgents,
            pinBoardEnabled: plan.pinBoardEnabled,
            isActive: plan.isActive,
        };
    }
}
