import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../infrastructure/di/tokens';
import type { IAdminRepository } from "../../../application/interfaces/repositories/admin.repository.interface";
import type { IHashService } from "../../../application/interfaces/services/hash.service.interface";
import type { IJwtService } from "../../../application/interfaces/services/jwt.service.interface";
import { LoginUserRequestDto } from "../../dtos/auth/request/login-user.dto";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";
import { Admin } from "../../../domain/entities/admin.entity";

import { IBaseUseCase } from "../../interfaces/use-cases/base.usecase.interface";
import { AdminAuthResponseDto } from "../../dtos/admin/response/admin-auth.response.dto";

@injectable()
export class AdminLoginUseCase implements IBaseUseCase<LoginUserRequestDto, AdminAuthResponseDto> {
    constructor(
        @inject(TOKENS.IAdminRepository) private _adminRepository: IAdminRepository,
        @inject(TOKENS.IHashService) private _hashService: IHashService,
        @inject(TOKENS.IJwtService) private _jwtService: IJwtService
    ) { }

    async execute(data: LoginUserRequestDto): Promise<AdminAuthResponseDto> {
        const admin = await this._adminRepository.findByEmail(data.email);
        if (!admin || !admin.password || !data.password) {
            throw new Error(ErrorMessage.INVALID_CREDENTIALS);
        }

        const isMatch = await this._hashService.compare(data.password, admin.password);
        if (!isMatch) {
            throw new Error(ErrorMessage.INVALID_CREDENTIALS);
        }

        if (!admin.id) {
            throw new Error(ErrorMessage.USER_NOT_FOUND);
        }

        const role = 'admin';
        const accessToken = this._jwtService.generateAccessToken(admin.id, role);
        const refreshToken = this._jwtService.generateRefreshToken(admin.id, role);

        return { 
            admin: {
                id: admin.id,
                name: admin.name,
                email: admin.email,
                role
            }, 
            accessToken, 
            refreshToken 
        };
    }
}
