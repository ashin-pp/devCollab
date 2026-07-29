import { UserProfileResponseDto } from "../../../dtos/user/response/user-profile.response.dto";

export interface ISearchUserByEmailUseCase {
    execute(payload: {email: string}): Promise<Partial<UserProfileResponseDto>>;
}
