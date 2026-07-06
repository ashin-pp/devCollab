import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../infrastructure/di/tokens';
import type { IAdminRepository } from "../../../application/interfaces/repositories/admin.repository.interface";
import type { IOtpRepository } from "../../../application/interfaces/repositories/otp.repository.interface";
import type { IHashService } from "../../../application/interfaces/services/hash.service.interface";
import { ResetPasswordRequestDto } from "../../dtos/auth/request/reset-password.dto";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";

import { IBaseUseCase } from "../../interfaces/use-cases/base.usecase.interface";

@injectable()
export class AdminResetPasswordUseCase implements IBaseUseCase<ResetPasswordRequestDto, void> {
    constructor(
        @inject(TOKENS.IAdminRepository) private _adminRepository: IAdminRepository,
        @inject(TOKENS.IOtpRepository) private _otpRepository: IOtpRepository,
        @inject(TOKENS.IHashService) private _hashService: IHashService
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
