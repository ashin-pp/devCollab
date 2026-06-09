import { IJwtService } from "../../../domain/services/IJwtService";
import { IUserRepository } from "../../../domain/repositories/IUserRepository";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";
import { AppError } from "../../../domain/errors/AppError";
import { HttpStatusCode } from "../../../domain/enums/HttpStatusCode";

export class RefreshTokenUseCase {
    constructor(
        private jwtService: IJwtService,
        private userRepository: IUserRepository
    ) {}

    async execute(refreshToken: string) {
        if (!refreshToken) {
            throw new AppError("No refresh token provided", HttpStatusCode.UNAUTHORIZED);
        }

        const decoded = this.jwtService.verifyRefreshToken(refreshToken);

        const user = await this.userRepository.findById(decoded.id);
        if (!user) {
            throw new Error(ErrorMessage.USER_NOT_FOUND);
        }

        if (user.status === 'blocked') {
            throw new Error(ErrorMessage.USER_BLOCKED);
        }

        const newAccessToken = this.jwtService.generateAccessToken(user.id!, decoded.role);

        return { user, accessToken: newAccessToken };
    }
}
