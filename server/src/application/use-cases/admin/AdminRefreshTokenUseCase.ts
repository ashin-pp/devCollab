import { IJwtService } from "../../../domain/services/IJwtService";
import { IAdminRepository } from "../../../domain/repositories/IAdminRepository";
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
            throw new AppError("No refresh token provided", HttpStatusCode.UNAUTHORIZED);
        }

        const decoded = this.jwtService.verifyRefreshToken(refreshToken);

        const admin = await this.adminRepository.findById(decoded.id);
        if (!admin) {
            throw new Error("Admin not found");
        }

        const newAccessToken = this.jwtService.generateAccessToken(admin.id!, decoded.role);

        return { admin, accessToken: newAccessToken };
    }
}
