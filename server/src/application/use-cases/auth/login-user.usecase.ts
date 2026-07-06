import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../infrastructure/di/tokens';
import type { IUserRepository } from "../../../application/interfaces/repositories/user.repository.interface";
import type { IHashService } from "../../../application/interfaces/services/hash.service.interface";
import type { IJwtService } from "../../../application/interfaces/services/jwt.service.interface";
import { LoginUserRequestDto } from "../../dtos/auth/request/login-user.dto";
import { AuthResponseDto } from "../../dtos/auth/response/auth.response.dto";
import { IBaseUseCase } from "../../interfaces/use-cases/base.usecase.interface";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";
import { UserStatus } from "../../../domain/enums/UserStatus";

@injectable()
export class LoginUserUseCase implements IBaseUseCase<LoginUserRequestDto, AuthResponseDto> {
    constructor(
        @inject(TOKENS.IUserRepository) private _userRepository: IUserRepository,
        @inject(TOKENS.IHashService) private _hashService: IHashService,
        @inject(TOKENS.IJwtService) private _jwtService: IJwtService
    ) { }

    async execute(payload: LoginUserRequestDto): Promise<AuthResponseDto> {
        const user = await this._userRepository.findByEmail(payload.email);
        if (!user || !user.password || !payload.password) {
            throw new Error(ErrorMessage.INVALID_CREDENTIALS);
        }

        const isMatch = await this._hashService.compare(payload.password, user.password);
        if (!isMatch) {
            throw new Error(ErrorMessage.INVALID_CREDENTIALS);
        }

        if (!user.isVerified) {
            throw new Error(ErrorMessage.EMAIL_NOT_VERIFIED);
        }

        if (user.status === UserStatus.BLOCKED) {
            throw new Error(ErrorMessage.USER_BLOCKED);
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
            refreshToken 
        };
    }
}
