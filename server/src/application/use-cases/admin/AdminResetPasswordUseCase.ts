import { IAdminRepository } from "../../repositories/IAdminRepository";
import { IOtpRepository } from "../../repositories/IOtpRepository";
import { IHashService } from "../../services/IHashService";
import { ResetPasswordDto } from "../../dto/ResetPasswordDto";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";

export class AdminResetPasswordUseCase {
    constructor(
        private adminRepository: IAdminRepository,
        private otpRepository: IOtpRepository,
        private hashService: IHashService
    ) { }

    async execute(data: ResetPasswordDto): Promise<void> {
        if (data.newPassword.trim().length < 6) {
            throw new Error("Password must be at least 6 characters");
        }

        if (data.newPassword !== data.confirmPassword) {
            throw new Error(ErrorMessage.PASSWORDS_DO_NOT_MATCH);
        }

        const admin = await this.adminRepository.findByEmail(data.email);
        if (!admin || !admin.id) {
            throw new Error(ErrorMessage.USER_NOT_FOUND);
        }

        const otpObject = await this.otpRepository.findValidOtpByEmail(data.email, data.otp);
        if (!otpObject) {
            throw new Error(ErrorMessage.INVALID_OTP);
        }

        const hashedPassword = await this.hashService.hash(data.newPassword);
        
        admin.password = hashedPassword;
        await this.adminRepository.update(admin.id, admin);

        if (otpObject.id) {
            await this.otpRepository.delete(otpObject.id);
        }
    }
}
