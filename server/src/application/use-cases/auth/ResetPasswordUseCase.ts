import { IUserRepository } from "../../../domain/repositories/IUserRepository";
import { IOtpRepository } from "../../../domain/repositories/IOtpRepository";
import { IHashService } from "../../../domain/services/IHashService";
import { ResetPasswordDto } from "../../dto/ResetPasswordDto";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";

export class ResetPasswordUseCase {
    constructor(
        private userRepository: IUserRepository,
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

        const user = await this.userRepository.findByEmail(data.email);
        if (!user || !user.id) {
            throw new Error(ErrorMessage.USER_NOT_FOUND);
        }

        const otpObject = await this.otpRepository.findValidOtpByEmail(data.email, data.otp);
        if (!otpObject) {
            throw new Error(ErrorMessage.INVALID_OTP);
        }

        const hashedPassword = await this.hashService.hash(data.newPassword);
        
        user.password = hashedPassword;
        await this.userRepository.update(user.id, user);

        if (otpObject.id) {
            await this.otpRepository.delete(otpObject.id);
        }
    }
}
