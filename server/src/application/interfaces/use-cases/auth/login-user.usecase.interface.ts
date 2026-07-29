import { LoginUserRequestDto } from "../../../dtos/auth/request/login-user.dto";
import { AuthResponseDto } from "../../../dtos/auth/response/auth.response.dto";

export interface ILoginUserUseCase {
    execute(payload: LoginUserRequestDto): Promise<AuthResponseDto>;
}
