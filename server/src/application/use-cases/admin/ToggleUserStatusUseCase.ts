import { IUserRepository } from "../../../application/repositories/IUserRepository";
import { AppError } from "../../../domain/errors/AppError";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";
import { HttpStatusCode } from "../../../domain/enums/HttpStatusCode";
import { UserStatus } from "../../../domain/enums/UserStatus";

export class ToggleUserStatusUseCase {
    constructor(private userRepository: IUserRepository) {}

    async execute(userId: string): Promise<UserStatus> {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new AppError(ErrorMessage.USER_NOT_FOUND, HttpStatusCode.NOT_FOUND);
        }

        user.status = user.status === UserStatus.ACTIVE ? UserStatus.BLOCKED : UserStatus.ACTIVE;
        await this.userRepository.update(userId, user);

        return user.status;
    }
}
