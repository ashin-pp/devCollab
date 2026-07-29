import { USECASE_TOKENS } from "../../../infrastructure/di/usecase.tokens";
import { inject, injectable } from 'tsyringe';
import type { IAdminRepository } from "../../../application/interfaces/repositories/admin.repository.interface";
import type { IOtpRepository } from "../../../application/interfaces/repositories/otp.repository.interface";
import { AppConstants } from "../../../domain/constants";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";
import { IAdminForgotPasswordUseCase } from "../../interfaces/use-cases/admin/admin-forgot-password.usecase.interface";
import type { ISendOtpUseCase } from "../../interfaces/use-cases/auth/send-otp.usecase.interface";
import { REPOSITORY_TOKENS } from "../../../infrastructure/di/repository.tokens";

@injectable()
export class AdminForgotPasswordUseCase implements IAdminForgotPasswordUseCase {
    constructor(
        @inject(REPOSITORY_TOKENS.IAdminRepository) private _adminRepository: IAdminRepository,
        @inject(USECASE_TOKENS.ISendOtpUseCase) private _sendOtpUseCase: ISendOtpUseCase,
        @inject(REPOSITORY_TOKENS.IOtpRepository) private _otpRepository: IOtpRepository
    ) { }

    async execute(email: string): Promise<void> {
        const admin = await this._adminRepository.findByEmail(email);
        
        if (!admin) {
            throw new Error(ErrorMessage.USER_NOT_FOUND);
        }

        const latestOtp = await this._otpRepository.findLatestOtpByEmail(email);
        if (latestOtp && latestOtp.createdAt) {
             const timeDiff = Date.now() - latestOtp.createdAt.getTime();
             if (timeDiff < AppConstants.OTP_RESEND_COOLDOWN_MS) {
                 throw new Error(ErrorMessage.OTP_COOLDOWN);
             }
        }

        await this._sendOtpUseCase.execute({ email });
    }
}
