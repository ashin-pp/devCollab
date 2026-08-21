import { inject, injectable } from 'tsyringe';
import { OAuth2Client } from 'google-auth-library';
import type { IPlanRepository } from "../../../application/interfaces/repositories/plan.repository.interface";
import type { IUserRepository } from "../../../application/interfaces/repositories/user.repository.interface";
import type { IJwtService } from "../../../application/interfaces/services/jwt.service.interface";
import { User } from "../../../domain/entities/user.entity";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";
import { HttpStatusCode } from "../../../domain/enums/HttpStatusCode";
import { UserStatus } from "../../../domain/enums/UserStatus";
import { AppError } from "../../../domain/errors/AppError";
import { assignStarterTrial } from "../../helpers/assign-starter-trial";
import { GoogleAuthRequestDto } from "../../dtos/auth/request/google-auth.dto";
import { AuthResponseDto } from "../../dtos/auth/response/auth.response.dto";
import { IGoogleAuthUseCase } from "../../interfaces/use-cases/auth/google-auth.usecase.interface";
import { REPOSITORY_TOKENS } from "../../../infrastructure/di/repository.tokens";
import { SERVICE_TOKENS } from "../../../infrastructure/di/service.tokens";
import { envConfig } from "../../../config/envConfig";

@injectable()
export class GoogleAuthUseCase implements IGoogleAuthUseCase {
    constructor(
        @inject(REPOSITORY_TOKENS.IUserRepository) private _userRepository: IUserRepository,
        @inject(REPOSITORY_TOKENS.IPlanRepository) private _planRepository: IPlanRepository,
        @inject(SERVICE_TOKENS.IJwtService) private _jwtService: IJwtService
    ) {}

    private async resolveGoogleProfile(token: string): Promise<{
        email: string;
        name?: string;
        googleId: string;
        picture?: string;
    }> {
        // Sign In With Google returns a JWT ID token (3 segments). Prefer verifying it —
        // avoids the OAuth popup / COOP issues on HTTP sites.
        if (token.split('.').length === 3) {
            if (!envConfig.googleClientId) {
                throw new AppError(ErrorMessage.INVALID_GOOGLE_TOKEN, HttpStatusCode.UNAUTHORIZED);
            }

            const client = new OAuth2Client(envConfig.googleClientId);
            const ticket = await client.verifyIdToken({
                idToken: token,
                audience: envConfig.googleClientId,
            });
            const payload = ticket.getPayload();

            if (!payload?.email || !payload.sub) {
                throw new AppError(ErrorMessage.INVALID_GOOGLE_TOKEN_PAYLOAD, HttpStatusCode.UNAUTHORIZED);
            }

            return {
                email: payload.email,
                name: payload.name,
                googleId: payload.sub,
                picture: payload.picture,
            };
        }

        // Legacy: access_token from useGoogleLogin popup flow
        const response = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
            throw new AppError(ErrorMessage.INVALID_GOOGLE_TOKEN, HttpStatusCode.UNAUTHORIZED);
        }

        const googlePayload = await response.json();

        if (!googlePayload?.email || !googlePayload.sub) {
            throw new AppError(ErrorMessage.INVALID_GOOGLE_TOKEN_PAYLOAD, HttpStatusCode.UNAUTHORIZED);
        }

        return {
            email: googlePayload.email,
            name: googlePayload.name,
            googleId: googlePayload.sub,
            picture: googlePayload.picture,
        };
    }

    async execute(payload: GoogleAuthRequestDto): Promise<AuthResponseDto> {
        const { email, name, googleId, picture } = await this.resolveGoogleProfile(payload.token);

        let user = await this._userRepository.findByEmail(email);
        let isNewUser = false;

        if (!user) {
            const newUser = new User(
                name || "Google User",
                email,
                undefined,
                picture
            );

            newUser.googleId = googleId;
            newUser.isVerified = true;
            await assignStarterTrial(newUser, this._planRepository);

            user = await this._userRepository.create(newUser);
            isNewUser = true;
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
            refreshToken,
            isNewUser,
        };
    }
}
