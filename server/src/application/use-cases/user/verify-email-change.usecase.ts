import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../infrastructure/di/tokens';
import type { IUserRepository } from "../../../application/interfaces/repositories/user.repository.interface";
import type { IOtpRepository } from "../../../application/interfaces/repositories/otp.repository.interface";
import { AppError } from "../../../domain/errors/AppError";
import { HttpStatusCode } from "../../../domain/enums/HttpStatusCode";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";

import { IBaseUseCase } from "../../interfaces/use-cases/base.usecase.interface";
import { VerifyEmailChangeRequestDto } from "../../dtos/user/request/verify-email-change.dto";

@injectable()
export class VerifyEmailChangeUseCase implements IBaseUseCase<VerifyEmailChangeRequestDto, void> {
    constructor(
        @inject(TOKENS.IUserRepository) private _userRepository: IUserRepository,
        @inject(TOKENS.IOtpRepository) private _otpRepository: IOtpRepository
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
