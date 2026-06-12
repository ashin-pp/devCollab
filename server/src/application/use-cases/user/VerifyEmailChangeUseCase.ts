import { IUserRepository } from "../../../domain/repositories/IUserRepository";
import { IOtpRepository } from "../../../domain/repositories/IOtpRepository";
import { AppError } from "../../../domain/errors/AppError";
import { HttpStatusCode } from "../../../domain/enums/HttpStatusCode";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";

export class VerifyEmailChangeUseCase {
    constructor(
        private userRepository: IUserRepository,
        private otpRepository: IOtpRepository
    ) {}

    async execute(userId: string, newEmail: string, otp: string): Promise<void> {
        const user = await this.userRepository.findById(userId);
        if (!user) throw new AppError(ErrorMessage.USER_NOT_FOUND, HttpStatusCode.NOT_FOUND);

        const otpRecord = await this.otpRepository.findLatestOtpByEmail(user.email);
        if (!otpRecord) throw new AppError(ErrorMessage.INVALID_OTP, HttpStatusCode.BAD_REQUEST);

        if (otpRecord.otp !== otp) throw new AppError(ErrorMessage.INVALID_OTP, HttpStatusCode.BAD_REQUEST);

        if (otpRecord.expiresAt < new Date()) {
            await this.otpRepository.deleteByEmail(user.email);
            throw new AppError(ErrorMessage.EXPIRED_OTP, HttpStatusCode.BAD_REQUEST);
        }

        const existingUser = await this.userRepository.findByEmail(newEmail);
        if (existingUser && existingUser.id !== userId) {
            throw new AppError(ErrorMessage.EMAIL_ALREADY_EXISTS, HttpStatusCode.BAD_REQUEST);
        }

        await this.userRepository.update(userId, { email: newEmail });
        await this.otpRepository.deleteByEmail(user.email);
    }
}
