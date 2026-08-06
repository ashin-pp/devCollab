import { PlanResponseDto } from "../../../dtos/plan/response/plan.response.dto";

export interface ITogglePlanStatusUseCase {
    execute(payload: { planId: string; isActive: boolean }): Promise<PlanResponseDto>;
}
