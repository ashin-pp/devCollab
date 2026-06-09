import { IUserRepository } from "../../../domain/repositories/IUserRepository";
import { AppError } from "../../../domain/errors/AppError";
import { HttpStatusCode } from "../../../domain/enums/HttpStatusCode";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";
import { UserProfileDTO } from "../../dtos/user/UserProfileDTO";

export class GetUserProfileUseCase {
    constructor(private userRepository: IUserRepository) {}

    async execute(userId: string): Promise<UserProfileDTO> {
        const user = await this.userRepository.findById(userId);
        if (!user || !user.id) {
            throw new AppError(ErrorMessage.USER_NOT_FOUND, HttpStatusCode.NOT_FOUND);
        }

        return {
            id: user.id,
            name: user.name,
            email: user.email,
            profileImage: user.profileImage,
            bio: user.bio,
            skills: user.skills || [],
            github: user.github,
            linkedin: user.linkedin,
            twitter: user.twitter
        };
    }
}
