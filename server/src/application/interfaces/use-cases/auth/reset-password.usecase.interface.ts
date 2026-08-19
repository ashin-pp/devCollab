import { ResetPasswordRequestDto } from "../../../dtos/auth/request/reset-password.dto";

export interface IResetPasswordUseCase {
    execute(payload: ResetPasswordRequestDto): Promise<void>;
}
