import { PlanResponseDto } from "../../../dtos/plan/response/plan.response.dto";

export interface IGetPlansUseCase {
    execute(): Promise<PlanResponseDto[]>;
}
