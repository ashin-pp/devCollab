import { ResetPasswordRequestDto } from "../../../dtos/auth/request/reset-password.dto";

export interface IAdminResetPasswordUseCase {
    execute(data: ResetPasswordRequestDto): Promise<void>;
}
