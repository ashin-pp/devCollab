import { inject, injectable } from 'tsyringe';
import type { IAdminRepository } from "../../../application/interfaces/repositories/admin.repository.interface";
import type { IOtpRepository } from "../../../application/interfaces/repositories/otp.repository.interface";
import type { IHashService } from "../../../application/interfaces/services/hash.service.interface";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";
import { ResetPasswordRequestDto } from "../../dtos/auth/request/reset-password.dto";

import { IAdminResetPasswordUseCase } from "../../interfaces/use-cases/admin/admin-reset-password.usecase.interface";
import { REPOSITORY_TOKENS } from "../../../infrastructure/di/repository.tokens";
import { SERVICE_TOKENS } from "../../../infrastructure/di/service.tokens";

@injectable()
export class AdminResetPasswordUseCase implements IAdminResetPasswordUseCase {
    constructor(
        @inject(REPOSITORY_TOKENS.IAdminRepository) private _adminRepository: IAdminRepository,
        @inject(REPOSITORY_TOKENS.IOtpRepository) private _otpRepository: IOtpRepository,
        @inject(SERVICE_TOKENS.IHashService) private _hashService: IHashService
    ) { }

    async execute(data: ResetPasswordRequestDto): Promise<void> {
        if (data.newPassword.trim().length < 6) {
            throw new Error(ErrorMessage.PASSWORD_TOO_SHORT);
        }

        if (data.newPassword !== data.confirmPassword) {
            throw new Error(ErrorMessage.PASSWORDS_DO_NOT_MATCH);
        }

        const admin = await this._adminRepository.findByEmail(data.email);
        if (!admin || !admin.id) {
            throw new Error(ErrorMessage.USER_NOT_FOUND);
        }

        const otpObject = await this._otpRepository.findValidOtpByEmail(data.email, data.otp);
        if (!otpObject) {
            throw new Error(ErrorMessage.INVALID_OTP);
        }

        const hashedPassword = await this._hashService.hash(data.newPassword);

        admin.password = hashedPassword;
        await this._adminRepository.update(admin.id, admin);

        if (otpObject.id) {
            await this._otpRepository.delete(otpObject.id);
        }
    }
}
