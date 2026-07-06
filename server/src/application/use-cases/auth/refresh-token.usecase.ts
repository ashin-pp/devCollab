import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../infrastructure/di/tokens';
import type { IJwtService } from "../../../application/interfaces/services/jwt.service.interface";
import type { IUserRepository } from "../../../application/interfaces/repositories/user.repository.interface";
import { AuthResponseDto } from "../../dtos/auth/response/auth.response.dto";
import { IBaseUseCase } from "../../interfaces/use-cases/base.usecase.interface";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";
import { AppError } from "../../../domain/errors/AppError";
import { HttpStatusCode } from "../../../domain/enums/HttpStatusCode";
import { UserStatus } from "../../../domain/enums/UserStatus";

@injectable()
export class RefreshTokenUseCase implements IBaseUseCase<{refreshToken: string}, AuthResponseDto> {
    constructor(
        @inject(TOKENS.IJwtService) private _jwtService: IJwtService,
        @inject(TOKENS.IUserRepository) private _userRepository: IUserRepository
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
