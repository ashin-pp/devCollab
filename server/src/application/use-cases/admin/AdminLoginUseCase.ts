import { IAdminRepository } from "../../repositories/IAdminRepository";
import { IHashService } from "../../services/IHashService";
import { IJwtService } from "../../services/IJwtService";
import { LoginUserDto } from "../../dto/LoginUserDto";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";

export class AdminLoginUseCase {
    constructor(
        private adminRepository: IAdminRepository,
        private hashService: IHashService,
        private jwtService: IJwtService
    ) { }

    async execute(data: LoginUserDto): Promise<{ accessToken: string, refreshToken: string }> {
        const admin = await this.adminRepository.findByEmail(data.email);
        if (!admin || !admin.password || !data.password) {
            throw new Error(ErrorMessage.INVALID_CREDENTIALS);
        }

        const isMatch = await this.hashService.compare(data.password, admin.password);
        if (!isMatch) {
            throw new Error(ErrorMessage.INVALID_CREDENTIALS);
        }

        if (!admin.id) {
            throw new Error(ErrorMessage.USER_NOT_FOUND);
        }

        const role = 'admin';
        const accessToken = this.jwtService.generateAccessToken(admin.id, role);
        const refreshToken = this.jwtService.generateRefreshToken(admin.id, role);

        return { accessToken, refreshToken };
    }
}
