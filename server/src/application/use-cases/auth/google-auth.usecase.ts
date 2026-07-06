import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../infrastructure/di/tokens';
import type { IUserRepository } from "../../../application/interfaces/repositories/user.repository.interface";
import type { IJwtService } from "../../../application/interfaces/services/jwt.service.interface";
import { User } from "../../../domain/entities/user.entity";
import { GoogleAuthRequestDto } from "../../dtos/auth/request/google-auth.dto";
import { AuthResponseDto } from "../../dtos/auth/response/auth.response.dto";
import { IBaseUseCase } from "../../interfaces/use-cases/base.usecase.interface";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";
import { AppError } from "../../../domain/errors/AppError";
import { HttpStatusCode } from "../../../domain/enums/HttpStatusCode";
import { UserStatus } from "../../../domain/enums/UserStatus";

@injectable()
export class GoogleAuthUseCase implements IBaseUseCase<GoogleAuthRequestDto, AuthResponseDto> {
    constructor(
        @inject(TOKENS.IUserRepository) private _userRepository: IUserRepository,
        @inject(TOKENS.IJwtService) private _jwtService: IJwtService
    ) {}

    async execute(payload: GoogleAuthRequestDto): Promise<AuthResponseDto> {
        const response = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
            headers: {
                Authorization: `Bearer ${payload.token}`
            }
        });

        if (!response.ok) {
            throw new AppError(ErrorMessage.INVALID_GOOGLE_TOKEN, HttpStatusCode.UNAUTHORIZED);
        }

        const googlePayload = await response.json();

        if (!googlePayload || !googlePayload.email) {
            throw new AppError(ErrorMessage.INVALID_GOOGLE_TOKEN_PAYLOAD, HttpStatusCode.UNAUTHORIZED);
        }

        const { email, name, sub: googleId, picture } = googlePayload;

        let user = await this._userRepository.findByEmail(email);

        if (!user) {
            const newUser = new User(
                name || "Google User",
                email,
                undefined,
                picture
            );

            newUser.googleId = googleId;
            newUser.isVerified = true;

            user = await this._userRepository.create(newUser);
        } else if (!user.googleId) {
            user.googleId = googleId;
            user.isVerified = true;
            if (user.id) await this._userRepository.update(user.id, user);
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
