import { inject, injectable } from 'tsyringe';
import type { IOtpRepository } from "../../../application/interfaces/repositories/otp.repository.interface";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";
import { IVerifyResetOtpUseCase } from "../../interfaces/use-cases/auth/verify-reset-otp.usecase.interface";
import { REPOSITORY_TOKENS } from "../../../infrastructure/di/repository.tokens";

@injectable()
export class VerifyResetOtpUseCase implements IVerifyResetOtpUseCase {
    constructor(
        @inject(REPOSITORY_TOKENS.IOtpRepository) private _otpRepository: IOtpRepository
    ) { }

    async execute(payload: {email: string, otp: string}): Promise<void> {
        const { email, otp } = payload;
        const otpRecord = await this._otpRepository.findValidOtpByEmail(email, otp);

        if (!otpRecord) {
            throw new Error(ErrorMessage.INVALID_OTP);
        }

        if (otpRecord.isExpired()) {
            throw new Error(ErrorMessage.EXPIRED_OTP);
        }
    }
}
