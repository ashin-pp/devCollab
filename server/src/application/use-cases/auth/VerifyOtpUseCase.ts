import { IOtpRepository } from "../../../application/repositories/IOtpRepository";
import { IUserRepository } from "../../../application/repositories/IUserRepository";
import { VerifyOtpDto } from "../../dto/VerifyOtpDto";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";

export class VerifyOtpUseCase {
    constructor(
        private otpRepository: IOtpRepository,
        private userRepository: IUserRepository
    ) { }

    async execute(data: VerifyOtpDto): Promise<void> {
        const otpRecord = await this.otpRepository.findValidOtpByEmail(data.email, data.otp);

        if (!otpRecord) {
            throw new Error(ErrorMessage.INVALID_OTP);
        }

        if (otpRecord.isExpired()) {
            throw new Error(ErrorMessage.EXPIRED_OTP);
        }

        otpRecord.markAsUsed();
        if (otpRecord.id) {
            await this.otpRepository.update(otpRecord.id, otpRecord);
        }

        const user = await this.userRepository.findByEmail(data.email);
        if (!user) {
            throw new Error(ErrorMessage.USER_NOT_FOUND);
        }

        user.isVerified = true;
        if (user.id) {
            await this.userRepository.update(user.id, user);
        }
    }
}
