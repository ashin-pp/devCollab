import { inject, injectable } from "tsyringe";
import type { IPlanRepository } from "../../interfaces/repositories/plan.repository.interface";
import { IGetPlansUseCase } from "../../interfaces/use-cases/plan/get-plans.usecase.interface";
import { PlanResponseDto } from "../../dtos/plan/response/plan.response.dto";
import { REPOSITORY_TOKENS } from "../../../infrastructure/di/repository.tokens";

@injectable()
export class GetPlansUseCase implements IGetPlansUseCase {
    constructor(
        @inject(REPOSITORY_TOKENS.IPlanRepository) private readonly _planRepository: IPlanRepository
    ) {}

    async execute(): Promise<PlanResponseDto[]> {
        const plans = await this._planRepository.findAllActive();

        return plans.map((plan) => ({
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
        }));
    }
}
