import { UpdateUserProfileRequestDto } from "../../../dtos/user/request/update-user-profile.dto";
import { UserProfileResponseDto } from "../../../dtos/user/response/user-profile.response.dto";

export interface IUpdateUserProfileUseCase {
    execute(payload: {userId: string, data: UpdateUserProfileRequestDto}): Promise<UserProfileResponseDto>;
}
