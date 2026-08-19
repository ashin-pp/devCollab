import { inject, injectable } from 'tsyringe';
import type { IUserRepository } from "../../../application/interfaces/repositories/user.repository.interface";
import type { IHashService } from "../../../application/interfaces/services/hash.service.interface";
import type { IJwtService } from "../../../application/interfaces/services/jwt.service.interface";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";
import { HttpStatusCode } from "../../../domain/enums/HttpStatusCode";
import { UserStatus } from "../../../domain/enums/UserStatus";
import { AppError } from "../../../domain/errors/AppError";
import { LoginUserRequestDto } from "../../dtos/auth/request/login-user.dto";
import { AuthResponseDto } from "../../dtos/auth/response/auth.response.dto";
import { ILoginUserUseCase } from "../../interfaces/use-cases/auth/login-user.usecase.interface";
import { REPOSITORY_TOKENS } from "../../../infrastructure/di/repository.tokens";
import { SERVICE_TOKENS } from "../../../infrastructure/di/service.tokens";

@injectable()
export class LoginUserUseCase implements ILoginUserUseCase {
    constructor(
        @inject(REPOSITORY_TOKENS.IUserRepository) private _userRepository: IUserRepository,
        @inject(SERVICE_TOKENS.IHashService) private _hashService: IHashService,
        @inject(SERVICE_TOKENS.IJwtService) private _jwtService: IJwtService
    ) { }

    async execute(payload: LoginUserRequestDto): Promise<AuthResponseDto> {
        const user = await this._userRepository.findByEmail(payload.email);
        if (!user || !user.password || !payload.password) {
            throw new AppError(ErrorMessage.INVALID_CREDENTIALS, HttpStatusCode.UNAUTHORIZED);
        }

        const isMatch = await this._hashService.compare(payload.password, user.password);
        if (!isMatch) {
            throw new AppError(ErrorMessage.INVALID_CREDENTIALS, HttpStatusCode.UNAUTHORIZED);
        }

        if (!user.isVerified) {
            throw new AppError(ErrorMessage.EMAIL_NOT_VERIFIED, HttpStatusCode.FORBIDDEN);
        }

        if (user.status === UserStatus.BLOCKED) {
            throw new AppError(ErrorMessage.USER_BLOCKED, HttpStatusCode.FORBIDDEN);
        }

        const role = 'user';
        const accessToken = this._jwtService.generateAccessToken(user.id!, role);
        const refreshToken = this._jwtService.generateRefreshToken(user.id!, role);

        return { 
            user: {
                id: user.id!,
                name: user.name,
                email: user.email,
                profileImage: user.profileImage,
                role: 'user',
                status: user.status,
                isVerified: user.isVerified,
                createdAt: user.createdAt as Date
            }, 
            accessToken, 
            refreshToken 
        };
    }
}
