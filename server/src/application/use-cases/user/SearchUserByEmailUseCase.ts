import { IUserRepository } from "../../../application/repositories/IUserRepository";
import { AppError } from "../../../domain/errors/AppError";
import { HttpStatusCode } from "../../../domain/enums/HttpStatusCode";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";
export class SearchUserByEmailUseCase {
    constructor(private userRepository: IUserRepository) { }

    async execute(email: string) {
        if (!email) {
            throw new AppError(ErrorMessage.EMAIL_REQUIRED_FOR_SEARCH, HttpStatusCode.BAD_REQUEST);
        }

        const user = await this.userRepository.findByEmail(email.toLowerCase());

        if (!user) {
            throw new AppError(ErrorMessage.USER_NOT_FOUND_WITH_EMAIL, HttpStatusCode.NOT_FOUND);
        }

        return {
            id: user.id,
            name: user.name,
            email: user.email,
            profileImage: user.profileImage,
            bio: user.bio
        };
    }
}
