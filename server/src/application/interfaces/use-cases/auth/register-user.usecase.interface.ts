import type { RegisterUserRequestDto } from "../../../dtos/auth/request/register-user.dto";
import type { UserResponseDto } from "../../../dtos/auth/response/user.response.dto";

export interface IRegisterUserUseCase {
    execute(data: RegisterUserRequestDto): Promise<UserResponseDto>;
}
