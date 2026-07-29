import { AdminResponseDto } from "../../../dtos/admin/response/admin.response.dto";
import { RegisterUserRequestDto } from "../../../dtos/auth/request/register-user.dto";

export interface ICreateAdminUseCase {
    execute(data: RegisterUserRequestDto): Promise<AdminResponseDto>;
}
