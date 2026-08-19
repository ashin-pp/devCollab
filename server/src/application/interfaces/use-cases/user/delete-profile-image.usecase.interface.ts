import { UserProfileResponseDto } from "../../../dtos/user/response/user-profile.response.dto";

export interface IDeleteProfileImageUseCase {
    execute(payload: {userId: string}): Promise<UserProfileResponseDto>;
}
