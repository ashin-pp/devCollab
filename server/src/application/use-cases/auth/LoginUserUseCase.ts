import { IUserRepository } from "../../../domain/repositories/IUserRepository";
import { IHashService } from "../../../domain/services/IHashService";
import { IJwtService } from "../../../domain/services/IJwtService";
import { LoginUserDto } from "../../dto/LoginUserDto";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";
import { User } from "../../../domain/entities/User";

export class LoginUserUseCase {
    constructor(
        private userRepository: IUserRepository,
        private hashService: IHashService,
        private jwtService: IJwtService
    ) { }

    async execute(data: LoginUserDto): Promise<{ user: User, accessToken: string, refreshToken: string }> {
        // 1. Find user by email
        const user = await this.userRepository.findByEmail(data.email);
        if (!user || !user.password || !data.password) {
            throw new Error(ErrorMessage.INVALID_CREDENTIALS);
        }

        // 2. Check if password matches
        const isMatch = await this.hashService.compare(data.password, user.password);
        if (!isMatch) {
            throw new Error(ErrorMessage.INVALID_CREDENTIALS);
        }

        if (!user.isVerified) {
            throw new Error(ErrorMessage.EMAIL_NOT_VERIFIED);
        }

        if (user.status === 'blocked') {
            throw new Error(ErrorMessage.USER_BLOCKED);
        }

        const role = 'user';
        const accessToken = this.jwtService.generateAccessToken(user.id!, role);
        const refreshToken = this.jwtService.generateRefreshToken(user.id!, role);

        return { user, accessToken, refreshToken };
    }
}
