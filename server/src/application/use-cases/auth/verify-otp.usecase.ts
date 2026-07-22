import { inject, injectable } from 'tsyringe';
import type { IOtpRepository } from "../../../application/interfaces/repositories/otp.repository.interface";
import type { IUserRepository } from "../../../application/interfaces/repositories/user.repository.interface";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";
import { VerifyOtpRequestDto } from "../../dtos/auth/request/verify-otp.dto";

import { IVerifyOtpUseCase } from "../../interfaces/use-cases/auth/verify-otp.usecase.interface";
import { REPOSITORY_TOKENS } from "../../../infrastructure/di/repository.tokens";

@injectable()
export class VerifyOtpUseCase implements IVerifyOtpUseCase {
    constructor(
        @inject(REPOSITORY_TOKENS.IOtpRepository) private _otpRepository: IOtpRepository,
        @inject(REPOSITORY_TOKENS.IUserRepository) private _userRepository: IUserRepository
    ) { }

    async execute(payload: VerifyOtpRequestDto): Promise<void> {
        const otpRecord = await this._otpRepository.findValidOtpByEmail(payload.email, payload.otp);

        if (!otpRecord) {
            throw new Error(ErrorMessage.INVALID_OTP);
        }

        if (otpRecord.isExpired()) {
            throw new Error(ErrorMessage.EXPIRED_OTP);
        }

        otpRecord.markAsUsed();
        if (otpRecord.id) {
            await this._otpRepository.update(otpRecord.id, otpRecord);
        }

        const user = await this._userRepository.findByEmail(payload.email);
        if (!user) {
            throw new Error(ErrorMessage.USER_NOT_FOUND);
        }

        user.isVerified = true;
        if (user.id) {
            await this._userRepository.update(user.id, user);
        }
    }
}
