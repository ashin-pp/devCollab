import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../infrastructure/di/tokens';
import type { IUserRepository } from "../../../application/interfaces/repositories/user.repository.interface";
import type { IOtpRepository } from "../../../application/interfaces/repositories/otp.repository.interface";
import type { IHashService } from "../../../application/interfaces/services/hash.service.interface";
import { ResetPasswordRequestDto } from "../../dtos/auth/request/reset-password.dto";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";

import { IBaseUseCase } from "../../interfaces/use-cases/base.usecase.interface";

@injectable()
export class ResetPasswordUseCase implements IBaseUseCase<ResetPasswordRequestDto, void> {
    constructor(
        @inject(TOKENS.IUserRepository) private _userRepository: IUserRepository,
        @inject(TOKENS.IOtpRepository) private _otpRepository: IOtpRepository,
        @inject(TOKENS.IHashService) private _hashService: IHashService
    ) { }

    async execute(payload: ResetPasswordRequestDto): Promise<void> {
        if (payload.newPassword.trim().length < 6) {
            throw new Error(ErrorMessage.PASSWORD_TOO_SHORT);
        }

        if (payload.newPassword !== payload.confirmPassword) {
            throw new Error(ErrorMessage.PASSWORDS_DO_NOT_MATCH);
        }

        const user = await this._userRepository.findByEmail(payload.email);
        if (!user || !user.id) {
            throw new Error(ErrorMessage.USER_NOT_FOUND);
        }

        const otpObject = await this._otpRepository.findValidOtpByEmail(payload.email, payload.otp);
        if (!otpObject) {
            throw new Error(ErrorMessage.INVALID_OTP);
        }

        const hashedPassword = await this._hashService.hash(payload.newPassword);

        user.password = hashedPassword;
        await this._userRepository.update(user.id, user);

        if (otpObject.id) {
            await this._otpRepository.delete(otpObject.id);
        }
    }
}
