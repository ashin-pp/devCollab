import { inject, injectable } from 'tsyringe';
import type { IUserRepository } from "../../../application/interfaces/repositories/user.repository.interface";
import type { IHashService } from "../../../application/interfaces/services/hash.service.interface";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";
import { HttpStatusCode } from "../../../domain/enums/HttpStatusCode";
import { AppError } from "../../../domain/errors/AppError";
import { ChangePasswordRequestDto } from "../../dtos/user/request/change-password.dto";

import { IChangePasswordUseCase } from "../../interfaces/use-cases/user/change-password.usecase.interface";
import { REPOSITORY_TOKENS } from "../../../infrastructure/di/repository.tokens";
import { SERVICE_TOKENS } from "../../../infrastructure/di/service.tokens";

@injectable()
export class ChangePasswordUseCase implements IChangePasswordUseCase {
    constructor(
        @inject(REPOSITORY_TOKENS.IUserRepository) private _userRepository: IUserRepository,
        @inject(SERVICE_TOKENS.IHashService) private _hashService: IHashService
    ) {}

    async execute(payload: {userId: string, dto: ChangePasswordRequestDto}): Promise<void> {
        const { userId, dto } = payload;

        const user = await this._userRepository.findById(userId);
        if (!user || !user.password) {
            throw new AppError(ErrorMessage.USER_NOT_FOUND, HttpStatusCode.NOT_FOUND);
        }

        const isValid = await this._hashService.compare(dto.currentPassword, user.password);
        if (!isValid) {
            throw new AppError(ErrorMessage.INCORRECT_CURRENT_PASSWORD, HttpStatusCode.BAD_REQUEST);
        }

        const hashedPassword = await this._hashService.hash(dto.newPassword);
        await this._userRepository.update(userId, { password: hashedPassword });
    }
}
