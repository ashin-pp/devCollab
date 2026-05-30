import { IOtpRepository } from "../../repositories/IOtpRepository";
import { IUserRepository } from "../../repositories/IUserRepository";
import { VerifyOtpDto } from "../../dto/VerifyOtpDto";

export class VerifyOtpUseCase {
    constructor(
        private otpRepository: IOtpRepository,
        private userRepository: IUserRepository
    ) { }

    async execute(data: VerifyOtpDto): Promise<void> {
        // 1. Ask the OTP Database if this code exists and is unused
        const otpRecord = await this.otpRepository.findValidOtpByEmail(data.email, data.otp);

        if (!otpRecord) {
            throw new Error("Invalid OTP"); // Not found or already used
        }

        // 2. Check if the code has expired (using our Domain Entity method!)
        if (otpRecord.isExpired()) {
            throw new Error("OTP has expired");
        }

        // 3. Mark the OTP as used and save it
        otpRecord.markAsUsed();
        if (otpRecord.id) {
            await this.otpRepository.update(otpRecord.id, otpRecord);
        }

        // 4. Find the User in the Database
        const user = await this.userRepository.findByEmail(data.email);
        if (!user) {
            throw new Error("User not found");
        }

        // 5. Change their status to Verified and save it!
        user.isVerified = true;
        if (user.id) {
            await this.userRepository.update(user.id, user);
        }
    }
}
