import { PlanResponseDto } from "../../../dtos/plan/response/plan.response.dto";
import { CreatePlanRequestDto } from "../../../dtos/plan/request/create-plan.dto";

export interface ICreatePlanUseCase {
    execute(payload: CreatePlanRequestDto & { createdBy: string }): Promise<PlanResponseDto>;
}
