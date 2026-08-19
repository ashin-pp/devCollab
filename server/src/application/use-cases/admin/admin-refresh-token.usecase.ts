import { inject, injectable } from 'tsyringe';
import type { IAdminRepository } from "../../../application/interfaces/repositories/admin.repository.interface";
import type { IJwtService } from "../../../application/interfaces/services/jwt.service.interface";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";
import { HttpStatusCode } from "../../../domain/enums/HttpStatusCode";
import { AppError } from "../../../domain/errors/AppError";
import { AdminAuthResponseDto } from "../../dtos/admin/response/admin-auth.response.dto";
import { IAdminRefreshTokenUseCase } from "../../interfaces/use-cases/admin/admin-refresh-token.usecase.interface";
import { REPOSITORY_TOKENS } from "../../../infrastructure/di/repository.tokens";
import { SERVICE_TOKENS } from "../../../infrastructure/di/service.tokens";

@injectable()
export class AdminRefreshTokenUseCase implements IAdminRefreshTokenUseCase {
    constructor(
        @inject(SERVICE_TOKENS.IJwtService) private _jwtService: IJwtService,
        @inject(REPOSITORY_TOKENS.IAdminRepository) private _adminRepository: IAdminRepository
    ) {}

    async execute(payload: {refreshToken: string}): Promise<AdminAuthResponseDto> {
        const { refreshToken } = payload;
        if (!refreshToken) {
            throw new AppError(ErrorMessage.NO_REFRESH_TOKEN, HttpStatusCode.UNAUTHORIZED);
        }

        const decoded = this._jwtService.verifyRefreshToken(refreshToken);

        const admin = await this._adminRepository.findById(decoded.id);
        if (!admin) {
            throw new AppError(ErrorMessage.ADMIN_NOT_FOUND, HttpStatusCode.NOT_FOUND);
        }

        const newAccessToken = this._jwtService.generateAccessToken(admin.id as string, decoded.role);

        return { 
            admin: {
                id: admin.id as string,
                name: admin.name,
                email: admin.email,
                role: decoded.role
            }, 
            accessToken: newAccessToken 
        };
    }
}
