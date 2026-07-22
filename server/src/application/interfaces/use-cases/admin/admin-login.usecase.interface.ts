import { AdminAuthResponseDto } from "../../../dtos/admin/response/admin-auth.response.dto";
import { LoginUserRequestDto } from "../../../dtos/auth/request/login-user.dto";

export interface IAdminLoginUseCase {
    execute(data: LoginUserRequestDto): Promise<AdminAuthResponseDto>;
}
