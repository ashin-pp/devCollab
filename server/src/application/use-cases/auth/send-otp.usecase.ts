import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../infrastructure/di/tokens';
import type { IOtpRepository } from "../../../application/interfaces/repositories/otp.repository.interface";
import type { IEmailService } from "../../../application/interfaces/services/email.service.interface";
import { OtpVerification } from "../../../domain/entities/otp-verification.entity";
import { AppConstants } from "../../../domain/constants";

import { IBaseUseCase } from "../../interfaces/use-cases/base.usecase.interface";

@injectable()
export class SendOtpUseCase implements IBaseUseCase<{email: string}, void> {
    constructor(
        @inject(TOKENS.IOtpRepository) private _otpRepository: IOtpRepository,
        @inject(TOKENS.IEmailService) private _emailService: IEmailService
    ) {}

    async execute(payload: {email: string}): Promise<void> {
        const { email } = payload;
        const otpCode = Math.floor(1000 + Math.random() * 9000).toString();

        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + AppConstants.OTP_EXPIRATION_MINUTES);

        const newOtp = new OtpVerification(
            email,
            otpCode,
            expiresAt
        );

        await this._otpRepository.deleteByEmail(email);
        await this._otpRepository.create(newOtp);
        await this._emailService.sendOtpEmail(email, otpCode);
    }
}
