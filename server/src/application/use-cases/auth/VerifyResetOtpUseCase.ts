import { IOtpRepository } from "../../../application/repositories/IOtpRepository";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";

export class VerifyResetOtpUseCase {
    constructor(private otpRepository: IOtpRepository) { }

    async execute(email: string, otp: string): Promise<void> {
        const otpRecord = await this.otpRepository.findValidOtpByEmail(email, otp);

        if (!otpRecord) {
            throw new Error(ErrorMessage.INVALID_OTP);
        }

        if (otpRecord.isExpired()) {
            throw new Error(ErrorMessage.EXPIRED_OTP);
        }
    }
}
