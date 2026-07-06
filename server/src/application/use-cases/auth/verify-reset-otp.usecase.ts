import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../infrastructure/di/tokens';
import type { IOtpRepository } from "../../../application/interfaces/repositories/otp.repository.interface";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";
import { IBaseUseCase } from "../../interfaces/use-cases/base.usecase.interface";

@injectable()
export class VerifyResetOtpUseCase implements IBaseUseCase<{email: string, otp: string}, void> {
    constructor(
        @inject(TOKENS.IOtpRepository) private _otpRepository: IOtpRepository
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
