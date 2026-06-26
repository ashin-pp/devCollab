import { IUserRepository } from "../../../application/repositories/IUserRepository";
import { IOtpRepository } from "../../../application/repositories/IOtpRepository";
import { IEmailService } from "../../../application/services/IEmailService";
import { AppError } from "../../../domain/errors/AppError";
import { HttpStatusCode } from "../../../domain/enums/HttpStatusCode";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";
import { OtpVerification } from "../../../domain/entities/OtpVerification";

export class RequestEmailChangeUseCase {
    constructor(
        private userRepository: IUserRepository,
        private otpRepository: IOtpRepository,
        private emailService: IEmailService
    ) {}

    async execute(userId: string, newEmail: string): Promise<void> {
        const user = await this.userRepository.findById(userId);
        if (!user) throw new AppError(ErrorMessage.USER_NOT_FOUND, HttpStatusCode.NOT_FOUND);

        const existingUser = await this.userRepository.findByEmail(newEmail);
        if (existingUser && existingUser.id !== userId) {
            throw new AppError(ErrorMessage.EMAIL_ALREADY_EXISTS, HttpStatusCode.BAD_REQUEST);
        }

        const otpCode = Math.floor(1000 + Math.random() * 9000).toString();
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 10);

        const newOtp = new OtpVerification(user.email, otpCode, expiresAt);
        await this.otpRepository.deleteByEmail(user.email);
        await this.otpRepository.create(newOtp);
        
        await this.emailService.sendOtpEmail(user.email, otpCode);
    }
}
