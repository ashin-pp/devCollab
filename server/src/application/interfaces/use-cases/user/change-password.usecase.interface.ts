import { ChangePasswordRequestDto } from "../../../dtos/user/request/change-password.dto";

export interface IChangePasswordUseCase {
    execute(payload: {userId: string, dto: ChangePasswordRequestDto}): Promise<void>;
}
