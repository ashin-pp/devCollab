import { IJwtService } from "../../../application/services/IJwtService";
import { IAdminRepository } from "../../../application/repositories/IAdminRepository";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";
import { AppError } from "../../../domain/errors/AppError";
import { HttpStatusCode } from "../../../domain/enums/HttpStatusCode";

export class AdminRefreshTokenUseCase {
    constructor(
        private jwtService: IJwtService,
        private adminRepository: IAdminRepository
    ) {}

    async execute(refreshToken: string) {
        if (!refreshToken) {
            throw new AppError(ErrorMessage.NO_REFRESH_TOKEN, HttpStatusCode.UNAUTHORIZED);
        }

        const decoded = this.jwtService.verifyRefreshToken(refreshToken);

        const admin = await this.adminRepository.findById(decoded.id);
        if (!admin) {
            throw new AppError(ErrorMessage.ADMIN_NOT_FOUND, HttpStatusCode.NOT_FOUND);
        }

        const newAccessToken = this.jwtService.generateAccessToken(admin.id!, decoded.role);

        return { admin, accessToken: newAccessToken };
    }
}
