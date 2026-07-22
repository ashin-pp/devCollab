import { UserProfileResponseDto } from "../../../dtos/user/response/user-profile.response.dto";

export interface IGetUserProfileUseCase {
    execute(payload: {userId: string}): Promise<UserProfileResponseDto>;
}
