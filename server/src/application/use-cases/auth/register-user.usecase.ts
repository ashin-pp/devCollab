import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../infrastructure/di/tokens';
import type { IUserRepository } from "../../../application/interfaces/repositories/user.repository.interface";
import type { IHashService } from "../../../application/interfaces/services/hash.service.interface";
import type { RegisterUserRequestDto } from "../../dtos/auth/request/register-user.dto";
import type { UserResponseDto } from "../../dtos/auth/response/user.response.dto";
import { IBaseUseCase } from "../../interfaces/use-cases/base.usecase.interface";
import { User } from "../../../domain/entities/user.entity";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";

@injectable()
export class RegisterUserUseCase implements IBaseUseCase<RegisterUserRequestDto, UserResponseDto> {
    constructor(
        @inject(TOKENS.IUserRepository) private _userRepository: IUserRepository,
        @inject(TOKENS.IHashService) private _hashService: IHashService
    ) { }

    async execute(data: RegisterUserRequestDto): Promise<UserResponseDto> {
        const existingUser = await this._userRepository.findByEmail(data.email);
        if (existingUser) {
            throw new Error(ErrorMessage.EMAIL_ALREADY_EXISTS);
        }

        if (data.password !== undefined) {
            if (data.password.trim().length < 6) {
                throw new Error(ErrorMessage.PASSWORD_TOO_SHORT);
            }
            if (data.password !== data.confirmPassword) {
                throw new Error(ErrorMessage.PASSWORDS_DO_NOT_MATCH);
            }
        } else if (data.confirmPassword !== undefined) {
             throw new Error(ErrorMessage.PASSWORDS_DO_NOT_MATCH);
        }

        let hashedPassword = data.password;
        if (data.password) {
            hashedPassword = await this._hashService.hash(data.password);
        }

        const newUser = new User(
            data.name,
            data.email,
            hashedPassword
        );

        const savedUser = await this._userRepository.create(newUser);
        
        return {
            id: savedUser.id!,
            name: savedUser.name,
            email: savedUser.email,
            status: savedUser.status,
            isVerified: savedUser.isVerified,
            createdAt: savedUser.createdAt as Date
        };
    }
}