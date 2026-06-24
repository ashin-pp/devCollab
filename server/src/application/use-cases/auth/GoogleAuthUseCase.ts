import { IUserRepository } from "../../../application/repositories/IUserRepository";
import { IJwtService } from "../../../application/services/IJwtService";
import { User } from "../../../domain/entities/User";
import { GoogleAuthDto } from "../../dto/GoogleAuthDto";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";
import { AppError } from "../../../domain/errors/AppError";
import { HttpStatusCode } from "../../../domain/enums/HttpStatusCode";
import { UserStatus } from "../../../domain/enums/UserStatus";

export class GoogleAuthUseCase {
    constructor(
        private userRepository: IUserRepository,
        private jwtService: IJwtService
    ) {}

    async execute(data: GoogleAuthDto): Promise<{ user: User, accessToken: string, refreshToken: string }> {
        const response = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
            headers: {
                Authorization: `Bearer ${data.token}`
            }
        });

        if (!response.ok) {
            throw new AppError(ErrorMessage.INVALID_GOOGLE_TOKEN, HttpStatusCode.UNAUTHORIZED);
        }

        const payload = await response.json();

        if (!payload || !payload.email) {
            throw new AppError(ErrorMessage.INVALID_GOOGLE_TOKEN_PAYLOAD, HttpStatusCode.UNAUTHORIZED);
        }

        const { email, name, sub: googleId, picture } = payload;

        let user = await this.userRepository.findByEmail(email);

        if (!user) {
            const newUser = new User(
                name || "Google User",
                email,
                undefined,
                picture
            );

            newUser.googleId = googleId;
            newUser.isVerified = true;

            user = await this.userRepository.create(newUser);
        } else if (!user.googleId) {
            user.googleId = googleId;
            user.isVerified = true;
            if (user.id) await this.userRepository.update(user.id, user);
        }

        if (user.status === UserStatus.BLOCKED) {
            throw new AppError(ErrorMessage.USER_BLOCKED, HttpStatusCode.FORBIDDEN);
        }

        const role = 'user';
        const accessToken = this.jwtService.generateAccessToken(user.id!, role);
        const refreshToken = this.jwtService.generateRefreshToken(user.id!, role);

        return { user, accessToken, refreshToken };
    }
}
