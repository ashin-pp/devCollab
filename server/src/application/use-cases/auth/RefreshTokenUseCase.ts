import { IJwtService } from "../../services/IJwtService";
import { IUserRepository } from "../../repositories/IUserRepository";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";

export class RefreshTokenUseCase {
    constructor(
        private jwtService: IJwtService,
        private userRepository: IUserRepository
    ) {}

    async execute(refreshToken: string) {
        if (!refreshToken) {
            throw new Error("No refresh token provided");
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
