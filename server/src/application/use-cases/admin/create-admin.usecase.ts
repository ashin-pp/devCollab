import { inject, injectable } from 'tsyringe';
import type { IAdminRepository } from "../../../application/interfaces/repositories/admin.repository.interface";
import type { IHashService } from "../../../application/interfaces/services/hash.service.interface";
import { Admin } from "../../../domain/entities/admin.entity";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";
import { RegisterUserRequestDto } from "../../dtos/auth/request/register-user.dto";

import { AdminResponseDto } from "../../dtos/admin/response/admin.response.dto";
import { ICreateAdminUseCase } from "../../interfaces/use-cases/admin/create-admin.usecase.interface";
import { REPOSITORY_TOKENS } from "../../../infrastructure/di/repository.tokens";
import { SERVICE_TOKENS } from "../../../infrastructure/di/service.tokens";

@injectable()
export class CreateAdminUseCase implements ICreateAdminUseCase {
    constructor(
        @inject(REPOSITORY_TOKENS.IAdminRepository) private _adminRepository: IAdminRepository,
        @inject(SERVICE_TOKENS.IHashService) private _hashService: IHashService
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
