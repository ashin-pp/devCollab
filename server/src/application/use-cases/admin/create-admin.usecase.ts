import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../infrastructure/di/tokens';
import type { IAdminRepository } from "../../../application/interfaces/repositories/admin.repository.interface";
import type { IHashService } from "../../../application/interfaces/services/hash.service.interface";
import { Admin } from "../../../domain/entities/admin.entity";
import { RegisterUserRequestDto } from "../../dtos/auth/request/register-user.dto";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";

import { IBaseUseCase } from "../../interfaces/use-cases/base.usecase.interface";
import { AdminResponseDto } from "../../dtos/admin/response/admin.response.dto";

@injectable()
export class CreateAdminUseCase implements IBaseUseCase<RegisterUserRequestDto, AdminResponseDto> {
    constructor(
        @inject(TOKENS.IAdminRepository) private _adminRepository: IAdminRepository,
        @inject(TOKENS.IHashService) private _hashService: IHashService
    ) { }

    async execute(data: RegisterUserRequestDto): Promise<AdminResponseDto> {
        const existingAdmin = await this._adminRepository.findByEmail(data.email);
        if (existingAdmin) {
            throw new Error(ErrorMessage.EMAIL_ALREADY_EXISTS);
        }

        if (!data.password || data.password.trim().length < 6) {
            throw new Error(ErrorMessage.PASSWORD_TOO_SHORT);
        }

        if (data.password !== data.confirmPassword) {
            throw new Error(ErrorMessage.PASSWORDS_DO_NOT_MATCH);
        }

        const hashedPassword = await this._hashService.hash(data.password!);

        const newAdmin = new Admin(
            data.name,
            data.email,
            hashedPassword
        );

        const savedAdmin = await this._adminRepository.create(newAdmin);
        return {
            id: savedAdmin.id as string,
            name: savedAdmin.name,
            email: savedAdmin.email,
            createdAt: savedAdmin.createdAt as Date,
            updatedAt: savedAdmin.updatedAt as Date
        };
    }
}
