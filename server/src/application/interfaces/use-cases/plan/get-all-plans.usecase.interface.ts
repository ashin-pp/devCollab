import { PlanResponseDto } from "../../../dtos/plan/response/plan.response.dto";

export interface IGetAllPlansUseCase {
    execute(): Promise<PlanResponseDto[]>;
}
