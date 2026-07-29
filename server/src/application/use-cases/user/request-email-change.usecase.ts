import { inject, injectable } from 'tsyringe';
import type { IOtpRepository } from "../../../application/interfaces/repositories/otp.repository.interface";
import type { IUserRepository } from "../../../application/interfaces/repositories/user.repository.interface";
import type { IEmailService } from "../../../application/interfaces/services/email.service.interface";
import { AppConstants } from "../../../domain/constants";
import { OtpVerification } from "../../../domain/entities/otp-verification.entity";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";
import { HttpStatusCode } from "../../../domain/enums/HttpStatusCode";
import { AppError } from "../../../domain/errors/AppError";
import { RequestEmailChangeDto } from "../../dtos/user/request/request-email-change.dto";
import { IRequestEmailChangeUseCase } from "../../interfaces/use-cases/user/request-email-change.usecase.interface";
import { REPOSITORY_TOKENS } from "../../../infrastructure/di/repository.tokens";
import { SERVICE_TOKENS } from "../../../infrastructure/di/service.tokens";

@injectable()
export class RequestEmailChangeUseCase implements IRequestEmailChangeUseCase {
    constructor(
        @inject(REPOSITORY_TOKENS.IUserRepository) private _userRepository: IUserRepository,
        @inject(REPOSITORY_TOKENS.IOtpRepository) private _otpRepository: IOtpRepository,
        @inject(SERVICE_TOKENS.IEmailService) private _emailService: IEmailService
    ) {}

    async execute(payload: RequestEmailChangeDto): Promise<void> {
        const { userId, newEmail } = payload;
        const user = await this._userRepository.findById(userId);
        if (!user) throw new AppError(ErrorMessage.USER_NOT_FOUND, HttpStatusCode.NOT_FOUND);

        const existingUser = await this._userRepository.findByEmail(newEmail);
        if (existingUser && existingUser.id !== userId) {
            throw new AppError(ErrorMessage.EMAIL_ALREADY_EXISTS, HttpStatusCode.BAD_REQUEST);
        }

        const otpCode = Math.floor(1000 + Math.random() * 9000).toString();
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + AppConstants.OTP_EXPIRATION_MINUTES);

        const newOtp = new OtpVerification(user.email, otpCode, expiresAt);
        await this._otpRepository.deleteByEmail(user.email);
        await this._otpRepository.create(newOtp);
        
        await this._emailService.sendOtpEmail(user.email, otpCode);
    }
}
