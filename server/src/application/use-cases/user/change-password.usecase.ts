import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../infrastructure/di/tokens';
import type { IUserRepository } from "../../../application/interfaces/repositories/user.repository.interface";
import type { IHashService } from "../../../application/interfaces/services/hash.service.interface";
import { AppError } from "../../../domain/errors/AppError";
import { HttpStatusCode } from "../../../domain/enums/HttpStatusCode";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";
import { ChangePasswordRequestDto } from "../../dtos/user/request/change-password.dto";

import { IBaseUseCase } from "../../interfaces/use-cases/base.usecase.interface";

@injectable()
export class ChangePasswordUseCase implements IBaseUseCase<{userId: string, dto: ChangePasswordRequestDto}, void> {
    constructor(
        @inject(TOKENS.IUserRepository) private _userRepository: IUserRepository,
        @inject(TOKENS.IHashService) private _hashService: IHashService
    ) {}

    async execute(payload: {userId: string, dto: ChangePasswordRequestDto}): Promise<void> {
        const { userId, dto } = payload;
        if (!dto.currentPassword || !dto.newPassword) {
            throw new AppError(ErrorMessage.PASSWORDS_DO_NOT_MATCH, HttpStatusCode.BAD_REQUEST);
        }

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
