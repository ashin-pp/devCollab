import { IOtpRepository } from "../../repositories/IOtpRepository";
import { IUserRepository } from "../../repositories/IUserRepository";
import { VerifyOtpDto } from "../../dto/VerifyOtpDto";

export class VerifyOtpUseCase {
    constructor(
        private otpRepository: IOtpRepository,
        private userRepository: IUserRepository
    ) { }

    async execute(data: VerifyOtpDto): Promise<void> {
        const otpRecord = await this.otpRepository.findValidOtpByEmail(data.email, data.otp);

        if (!otpRecord) {
            throw new Error("Invalid OTP");
        }

        if (otpRecord.isExpired()) {
            throw new Error("OTP has expired");
        }

        otpRecord.markAsUsed();
        if (otpRecord.id) {
            await this.otpRepository.update(otpRecord.id, otpRecord);
        }

        const user = await this.userRepository.findByEmail(data.email);
        if (!user) {
            throw new Error("User not found");
        }

        user.isVerified = true;
        if (user.id) {
            await this.userRepository.update(user.id, user);
        }
    }
}
