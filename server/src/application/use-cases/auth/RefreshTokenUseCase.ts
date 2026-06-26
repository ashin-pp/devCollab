import { IJwtService } from "../../../application/services/IJwtService";
import { IUserRepository } from "../../../application/repositories/IUserRepository";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";
import { AppError } from "../../../domain/errors/AppError";
import { HttpStatusCode } from "../../../domain/enums/HttpStatusCode";
import { UserStatus } from "../../../domain/enums/UserStatus";

export class RefreshTokenUseCase {
    constructor(
        private jwtService: IJwtService,
        private userRepository: IUserRepository
    ) {}

    async execute(refreshToken: string) {
        if (!refreshToken) {
            throw new AppError(ErrorMessage.NO_REFRESH_TOKEN, HttpStatusCode.UNAUTHORIZED);
        }

        const decoded = this.jwtService.verifyRefreshToken(refreshToken);

        const user = await this.userRepository.findById(decoded.id);
        if (!user) {
            throw new AppError(ErrorMessage.USER_NOT_FOUND, HttpStatusCode.NOT_FOUND);
        }

        if (user.status === UserStatus.BLOCKED) {
            throw new AppError(ErrorMessage.USER_BLOCKED, HttpStatusCode.FORBIDDEN);
        }

        const newAccessToken = this.jwtService.generateAccessToken(user.id!, decoded.role);

        return { user, accessToken: newAccessToken };
    }
}
