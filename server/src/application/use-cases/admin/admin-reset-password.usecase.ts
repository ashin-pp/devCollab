import { inject, injectable } from 'tsyringe';
import type { IAdminRepository } from "../../../application/interfaces/repositories/admin.repository.interface";
import type { IOtpRepository } from "../../../application/interfaces/repositories/otp.repository.interface";
import type { IHashService } from "../../../application/interfaces/services/hash.service.interface";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";
import { HttpStatusCode } from "../../../domain/enums/HttpStatusCode";
import { AppError } from "../../../domain/errors/AppError";
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
            throw new AppError(ErrorMessage.PASSWORD_TOO_SHORT, HttpStatusCode.BAD_REQUEST);
        }

        if (data.newPassword !== data.confirmPassword) {
            throw new AppError(ErrorMessage.PASSWORDS_DO_NOT_MATCH, HttpStatusCode.BAD_REQUEST);
        }

        const admin = await this._adminRepository.findByEmail(data.email);
        if (!admin || !admin.id) {
            throw new AppError(ErrorMessage.ADMIN_NOT_FOUND, HttpStatusCode.NOT_FOUND);
        }

        const otpObject = await this._otpRepository.findValidOtpByEmail(data.email, data.otp);
        if (!otpObject) {
            throw new AppError(ErrorMessage.INVALID_OTP, HttpStatusCode.BAD_REQUEST);
        }

        const hashedPassword = await this._hashService.hash(data.newPassword);

        admin.password = hashedPassword;
        await this._adminRepository.update(admin.id, admin);

        if (otpObject.id) {
            await this._otpRepository.delete(otpObject.id);
        }
    }
}
