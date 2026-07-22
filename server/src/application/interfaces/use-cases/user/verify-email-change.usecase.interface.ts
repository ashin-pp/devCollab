import { VerifyEmailChangeRequestDto } from "../../../dtos/user/request/verify-email-change.dto";

export interface IVerifyEmailChangeUseCase {
    execute(payload: VerifyEmailChangeRequestDto): Promise<void>;
}
