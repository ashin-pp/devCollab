import { inject, injectable } from 'tsyringe';
import type { IOtpRepository } from "../../../application/interfaces/repositories/otp.repository.interface";
import type { IUserRepository } from "../../../application/interfaces/repositories/user.repository.interface";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";
import { HttpStatusCode } from "../../../domain/enums/HttpStatusCode";
import { AppError } from "../../../domain/errors/AppError";
import { VerifyEmailChangeRequestDto } from "../../dtos/user/request/verify-email-change.dto";
import { IVerifyEmailChangeUseCase } from "../../interfaces/use-cases/user/verify-email-change.usecase.interface";
import { REPOSITORY_TOKENS } from "../../../infrastructure/di/repository.tokens";

@injectable()
export class VerifyEmailChangeUseCase implements IVerifyEmailChangeUseCase {
    constructor(
        @inject(REPOSITORY_TOKENS.IUserRepository) private _userRepository: IUserRepository,
        @inject(REPOSITORY_TOKENS.IOtpRepository) private _otpRepository: IOtpRepository
    ) {}

    async execute(payload: VerifyEmailChangeRequestDto): Promise<void> {
        const { userId, newEmail, otp } = payload;
        const user = await this._userRepository.findById(userId);
        if (!user) throw new AppError(ErrorMessage.USER_NOT_FOUND, HttpStatusCode.NOT_FOUND);

        const otpRecord = await this._otpRepository.findLatestOtpByEmail(user.email);
        if (!otpRecord) throw new AppError(ErrorMessage.INVALID_OTP, HttpStatusCode.BAD_REQUEST);

        if (otpRecord.otp !== otp) throw new AppError(ErrorMessage.INVALID_OTP, HttpStatusCode.BAD_REQUEST);

        if (otpRecord.expiresAt < new Date()) {
            await this._otpRepository.deleteByEmail(user.email);
            throw new AppError(ErrorMessage.EXPIRED_OTP, HttpStatusCode.BAD_REQUEST);
        }

        const existingUser = await this._userRepository.findByEmail(newEmail);
        if (existingUser && existingUser.id !== userId) {
            throw new AppError(ErrorMessage.EMAIL_ALREADY_EXISTS, HttpStatusCode.BAD_REQUEST);
        }

        await this._userRepository.update(userId, { email: newEmail });
        await this._otpRepository.deleteByEmail(user.email);
    }
}
