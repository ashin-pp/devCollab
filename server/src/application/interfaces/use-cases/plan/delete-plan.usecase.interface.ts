import { PlanResponseDto } from "../../../dtos/plan/response/plan.response.dto";

export interface IDeletePlanUseCase {
    execute(payload: { planId: string }): Promise<PlanResponseDto>;
}
