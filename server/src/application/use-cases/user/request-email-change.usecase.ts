import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../infrastructure/di/tokens';
import type { IUserRepository } from "../../../application/interfaces/repositories/user.repository.interface";
import type { IOtpRepository } from "../../../application/interfaces/repositories/otp.repository.interface";
import type { IEmailService } from "../../../application/interfaces/services/email.service.interface";
import { AppError } from "../../../domain/errors/AppError";
import { HttpStatusCode } from "../../../domain/enums/HttpStatusCode";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";
import { OtpVerification } from "../../../domain/entities/otp-verification.entity";
import { AppConstants } from "../../../domain/constants";

import { IBaseUseCase } from "../../interfaces/use-cases/base.usecase.interface";
import { RequestEmailChangeDto } from "../../dtos/user/request/request-email-change.dto";

@injectable()
export class RequestEmailChangeUseCase implements IBaseUseCase<RequestEmailChangeDto, void> {
    constructor(
        @inject(TOKENS.IUserRepository) private _userRepository: IUserRepository,
        @inject(TOKENS.IOtpRepository) private _otpRepository: IOtpRepository,
        @inject(TOKENS.IEmailService) private _emailService: IEmailService
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
