import { inject, injectable } from 'tsyringe';
import type { IPlanRepository } from "../../../application/interfaces/repositories/plan.repository.interface";
import type { IUserRepository } from "../../../application/interfaces/repositories/user.repository.interface";
import type { IHashService } from "../../../application/interfaces/services/hash.service.interface";
import { User } from "../../../domain/entities/user.entity";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";
import { HttpStatusCode } from "../../../domain/enums/HttpStatusCode";
import { AppError } from "../../../domain/errors/AppError";
import { assignStarterTrial } from "../../helpers/assign-starter-trial";
import type { RegisterUserRequestDto } from "../../dtos/auth/request/register-user.dto";
import type { UserResponseDto } from "../../dtos/auth/response/user.response.dto";
import { IRegisterUserUseCase } from "../../interfaces/use-cases/auth/register-user.usecase.interface";
import { REPOSITORY_TOKENS } from "../../../infrastructure/di/repository.tokens";
import { SERVICE_TOKENS } from "../../../infrastructure/di/service.tokens";

@injectable()
export class RegisterUserUseCase implements IRegisterUserUseCase {
    constructor(
        @inject(REPOSITORY_TOKENS.IUserRepository) private _userRepository: IUserRepository,
        @inject(REPOSITORY_TOKENS.IPlanRepository) private _planRepository: IPlanRepository,
        @inject(SERVICE_TOKENS.IHashService) private _hashService: IHashService
    ) { }

    async execute(data: RegisterUserRequestDto): Promise<UserResponseDto> {
        const existingUser = await this._userRepository.findByEmail(data.email);
        if (existingUser) {
            throw new AppError(ErrorMessage.EMAIL_ALREADY_EXISTS, HttpStatusCode.CONFLICT);
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
        await assignStarterTrial(newUser, this._planRepository);

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
