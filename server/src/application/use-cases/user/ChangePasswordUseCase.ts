import { IUserRepository } from "../../../domain/repositories/IUserRepository";
import { IHashService } from "../../../domain/services/IHashService";
import { AppError } from "../../../domain/errors/AppError";
import { HttpStatusCode } from "../../../domain/enums/HttpStatusCode";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";
import { ChangePasswordDTO } from "../../dtos/user/ChangePasswordDTO";

export class ChangePasswordUseCase {
    constructor(
        private userRepository: IUserRepository,
        private hashService: IHashService
    ) {}

    async execute(userId: string, dto: ChangePasswordDTO): Promise<void> {
        if (!dto.currentPassword || !dto.newPassword) {
            throw new AppError(ErrorMessage.PASSWORDS_DO_NOT_MATCH, HttpStatusCode.BAD_REQUEST);
        }

        const user = await this.userRepository.findById(userId);
        if (!user || !user.password) {
            throw new AppError(ErrorMessage.USER_NOT_FOUND, HttpStatusCode.NOT_FOUND);
        }

        const isValid = await this.hashService.compare(dto.currentPassword, user.password);
        if (!isValid) {
            throw new AppError(ErrorMessage.INCORRECT_CURRENT_PASSWORD, HttpStatusCode.BAD_REQUEST);
        }

        const hashedPassword = await this.hashService.hash(dto.newPassword);
        await this.userRepository.update(userId, { password: hashedPassword });
    }
}
