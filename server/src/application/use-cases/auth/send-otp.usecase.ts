import { inject, injectable } from 'tsyringe';
import type { IOtpRepository } from "../../../application/interfaces/repositories/otp.repository.interface";
import type { IEmailService } from "../../../application/interfaces/services/email.service.interface";
import { AppConstants } from "../../../domain/constants";
import { OtpVerification } from "../../../domain/entities/otp-verification.entity";
import { ISendOtpUseCase } from "../../interfaces/use-cases/auth/send-otp.usecase.interface";
import { REPOSITORY_TOKENS } from "../../../infrastructure/di/repository.tokens";
import { SERVICE_TOKENS } from "../../../infrastructure/di/service.tokens";

@injectable()
export class SendOtpUseCase implements ISendOtpUseCase {
    constructor(
        @inject(REPOSITORY_TOKENS.IOtpRepository) private _otpRepository: IOtpRepository,
        @inject(SERVICE_TOKENS.IEmailService) private _emailService: IEmailService
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
