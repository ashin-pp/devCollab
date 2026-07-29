import { inject, injectable } from 'tsyringe';
import type { IUserRepository } from "../../../application/interfaces/repositories/user.repository.interface";
import type { IJwtService } from "../../../application/interfaces/services/jwt.service.interface";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";
import { HttpStatusCode } from "../../../domain/enums/HttpStatusCode";
import { UserStatus } from "../../../domain/enums/UserStatus";
import { AppError } from "../../../domain/errors/AppError";
import { AuthResponseDto } from "../../dtos/auth/response/auth.response.dto";
import { IRefreshTokenUseCase } from "../../interfaces/use-cases/auth/refresh-token.usecase.interface";
import { REPOSITORY_TOKENS } from "../../../infrastructure/di/repository.tokens";
import { SERVICE_TOKENS } from "../../../infrastructure/di/service.tokens";

@injectable()
export class RefreshTokenUseCase implements IRefreshTokenUseCase {
    constructor(
        @inject(SERVICE_TOKENS.IJwtService) private _jwtService: IJwtService,
        @inject(REPOSITORY_TOKENS.IUserRepository) private _userRepository: IUserRepository
    ) {}

    async execute(payload: {refreshToken: string}): Promise<AuthResponseDto> {
        const { refreshToken } = payload;
        if (!refreshToken) {
            throw new AppError(ErrorMessage.NO_REFRESH_TOKEN, HttpStatusCode.UNAUTHORIZED);
        }

        const decoded = this._jwtService.verifyRefreshToken(refreshToken);

        const user = await this._userRepository.findById(decoded.id);
        if (!user) {
            throw new AppError(ErrorMessage.USER_NOT_FOUND, HttpStatusCode.NOT_FOUND);
        }

        if (user.status === UserStatus.BLOCKED) {
            throw new AppError(ErrorMessage.USER_BLOCKED, HttpStatusCode.FORBIDDEN);
        }

        const newAccessToken = this._jwtService.generateAccessToken(user.id as string, decoded.role);

        return { 
            user: {
                id: user.id as string,
                name: user.name,
                email: user.email,
                profileImage: user.profileImage,
                role: decoded.role,
                status: user.status,
                isVerified: user.isVerified,
                createdAt: user.createdAt as Date
            }, 
            accessToken: newAccessToken 
        };
    }
}
