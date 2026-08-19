import { inject, injectable } from 'tsyringe';
import type { IOtpRepository } from "../../../application/interfaces/repositories/otp.repository.interface";
import type { IUserRepository } from "../../../application/interfaces/repositories/user.repository.interface";
import type { IHashService } from "../../../application/interfaces/services/hash.service.interface";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";
import { HttpStatusCode } from "../../../domain/enums/HttpStatusCode";
import { AppError } from "../../../domain/errors/AppError";
import { ResetPasswordRequestDto } from "../../dtos/auth/request/reset-password.dto";

import { IResetPasswordUseCase } from "../../interfaces/use-cases/auth/reset-password.usecase.interface";
import { REPOSITORY_TOKENS } from "../../../infrastructure/di/repository.tokens";
import { SERVICE_TOKENS } from "../../../infrastructure/di/service.tokens";

@injectable()
export class ResetPasswordUseCase implements IResetPasswordUseCase {
    constructor(
        @inject(REPOSITORY_TOKENS.IUserRepository) private _userRepository: IUserRepository,
        @inject(REPOSITORY_TOKENS.IOtpRepository) private _otpRepository: IOtpRepository,
        @inject(SERVICE_TOKENS.IHashService) private _hashService: IHashService
    ) { }

    async execute(payload: ResetPasswordRequestDto): Promise<void> {
        const user = await this._userRepository.findByEmail(payload.email);
        if (!user || !user.id) {
            throw new AppError(ErrorMessage.USER_NOT_FOUND, HttpStatusCode.NOT_FOUND);
        }

        const otpObject = await this._otpRepository.findValidOtpByEmail(payload.email, payload.otp);
        if (!otpObject) {
            throw new AppError(ErrorMessage.INVALID_OTP, HttpStatusCode.BAD_REQUEST);
        }

        const hashedPassword = await this._hashService.hash(payload.newPassword);

        user.password = hashedPassword;
        await this._userRepository.update(user.id, user);

        if (otpObject.id) {
            await this._otpRepository.delete(otpObject.id);
        }
    }
}
