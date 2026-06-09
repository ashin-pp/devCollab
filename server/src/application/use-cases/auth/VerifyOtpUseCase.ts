import { IOtpRepository } from "../../../domain/repositories/IOtpRepository";
import { IUserRepository } from "../../../domain/repositories/IUserRepository";
import { VerifyOtpDto } from "../../dto/VerifyOtpDto";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";

export class VerifyOtpUseCase {
    constructor(
        private otpRepository: IOtpRepository,
        private userRepository: IUserRepository
    ) { }

    async execute(data: VerifyOtpDto): Promise<void> {
        // 1. Ask the OTP Database if this code exists and is unused
        const otpRecord = await this.otpRepository.findValidOtpByEmail(data.email, data.otp);

        if (!otpRecord) {
            throw new Error(ErrorMessage.INVALID_OTP); // Not found or already used
        }

        // 2. Check if the code has expired (using our Domain Entity method!)
        if (otpRecord.isExpired()) {
            throw new Error(ErrorMessage.EXPIRED_OTP);
        }

        // 3. Mark the OTP as used and save it
        otpRecord.markAsUsed();
        if (otpRecord.id) {
            await this.otpRepository.update(otpRecord.id, otpRecord);
        }

        // 4. Find the User in the Database
        const user = await this.userRepository.findByEmail(data.email);
        if (!user) {
            throw new Error(ErrorMessage.USER_NOT_FOUND);
        }

        // 5. Change their status to Verified and save it!
        user.isVerified = true;
        if (user.id) {
            await this.userRepository.update(user.id, user);
        }
    }
}
