import { IUserRepository } from "../../../domain/repositories/IUserRepository";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";

export class ToggleUserStatusUseCase {
    constructor(private userRepository: IUserRepository) { }

    async execute(userId: string): Promise<string> {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new Error(ErrorMessage.USER_NOT_FOUND);
        }

        user.status = user.status === "active" ? "blocked" : "active";
        
        await this.userRepository.update(userId, user);
        return user.status;
    }
}
