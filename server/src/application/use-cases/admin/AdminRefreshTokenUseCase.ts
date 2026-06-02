import { IJwtService } from "../../services/IJwtService";
import { IAdminRepository } from "../../repositories/IAdminRepository";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";

export class AdminRefreshTokenUseCase {
    constructor(
        private jwtService: IJwtService,
        private adminRepository: IAdminRepository
    ) {}

    async execute(refreshToken: string) {
        if (!refreshToken) {
            throw new Error("No refresh token provided");
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
