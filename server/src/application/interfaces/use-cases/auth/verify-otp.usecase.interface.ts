import { VerifyOtpRequestDto } from "../../../dtos/auth/request/verify-otp.dto";

export interface IVerifyOtpUseCase {
    execute(payload: VerifyOtpRequestDto): Promise<void>;
}
