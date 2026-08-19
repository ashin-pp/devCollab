import { SelectUserPlanRequestDto } from "../../../dtos/user/request/select-user-plan.dto";
import { UserProfileResponseDto } from "../../../dtos/user/response/user-profile.response.dto";

export interface ISelectUserPlanUseCase {
    execute(payload: { userId: string; data: SelectUserPlanRequestDto }): Promise<UserProfileResponseDto>;
}
