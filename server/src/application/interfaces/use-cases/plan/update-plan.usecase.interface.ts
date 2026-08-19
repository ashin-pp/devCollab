import { PlanResponseDto } from "../../../dtos/plan/response/plan.response.dto";
import { UpdatePlanRequestDto } from "../../../dtos/plan/request/update-plan.dto";

export interface IUpdatePlanUseCase {
    execute(payload: UpdatePlanRequestDto): Promise<PlanResponseDto>;
}
