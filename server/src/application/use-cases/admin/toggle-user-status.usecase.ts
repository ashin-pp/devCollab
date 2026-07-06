import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../infrastructure/di/tokens';
import type { IUserRepository } from "../../../application/interfaces/repositories/user.repository.interface";
import { AppError } from "../../../domain/errors/AppError";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";
import { HttpStatusCode } from "../../../domain/enums/HttpStatusCode";
import { UserStatus } from "../../../domain/enums/UserStatus";

import { IBaseUseCase } from "../../interfaces/use-cases/base.usecase.interface";

@injectable()
export class ToggleUserStatusUseCase implements IBaseUseCase<{userId: string}, UserStatus> {
    constructor(
        @inject(TOKENS.IUserRepository) private _userRepository: IUserRepository
    ) {}

    async execute(payload: {userId: string}): Promise<UserStatus> {
        const { userId } = payload;
        const user = await this._userRepository.findById(userId);
        if (!user) {
            throw new AppError(ErrorMessage.USER_NOT_FOUND, HttpStatusCode.NOT_FOUND);
        }

        user.status = user.status === UserStatus.ACTIVE ? UserStatus.BLOCKED : UserStatus.ACTIVE;
        await this._userRepository.update(userId, user);

        return user.status;
    }
}
