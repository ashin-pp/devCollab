import { IAdminRepository } from "../../../application/repositories/IAdminRepository";
import { IOtpRepository } from "../../../application/repositories/IOtpRepository";
import { SendOtpUseCase } from "../auth/SendOtpUseCase";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";

export class AdminForgotPasswordUseCase {
    constructor(
        private adminRepository: IAdminRepository,
        private sendOtpUseCase: SendOtpUseCase,
        private otpRepository: IOtpRepository
    ) { }

    async execute(email: string): Promise<void> {
        const admin = await this.adminRepository.findByEmail(email);
        
        if (!admin) {
            throw new Error(ErrorMessage.USER_NOT_FOUND);
        }

        const latestOtp = await this.otpRepository.findLatestOtpByEmail(email);
        if (latestOtp && latestOtp.createdAt) {
             const timeDiff = Date.now() - latestOtp.createdAt.getTime();
             if (timeDiff < 60000) {
                 throw new Error(ErrorMessage.OTP_COOLDOWN);
             }
        }

        await this.sendOtpUseCase.execute(email);
    }
}
