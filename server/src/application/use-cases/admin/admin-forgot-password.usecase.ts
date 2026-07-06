import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../infrastructure/di/tokens';
import type { IAdminRepository } from "../../../application/interfaces/repositories/admin.repository.interface";
import type { IOtpRepository } from "../../../application/interfaces/repositories/otp.repository.interface";
import { SendOtpUseCase } from "../auth/send-otp.usecase";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";
import { AppConstants } from "../../../domain/constants";

@injectable()
export class AdminForgotPasswordUseCase {
    constructor(
        @inject(TOKENS.IAdminRepository) private _adminRepository: IAdminRepository,
        @inject(SendOtpUseCase) private _sendOtpUseCase: SendOtpUseCase,
        @inject(TOKENS.IOtpRepository) private _otpRepository: IOtpRepository
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
