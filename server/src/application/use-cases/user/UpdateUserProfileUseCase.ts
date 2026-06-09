import { IUserRepository } from "../../../domain/repositories/IUserRepository";
import { AppError } from "../../../domain/errors/AppError";
import { HttpStatusCode } from "../../../domain/enums/HttpStatusCode";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";
import { UpdateUserProfileDTO } from "../../dtos/user/UpdateUserProfileDTO";
import { UserProfileDTO } from "../../dtos/user/UserProfileDTO";

export class UpdateUserProfileUseCase {
    constructor(private userRepository: IUserRepository) {}

    async execute(userId: string, data: UpdateUserProfileDTO): Promise<UserProfileDTO> {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new AppError(ErrorMessage.USER_NOT_FOUND, HttpStatusCode.NOT_FOUND);
        }

        const updatedUser = await this.userRepository.update(userId, data);
        if (!updatedUser || !updatedUser.id) {
             throw new AppError(ErrorMessage.FAILED_TO_UPDATE_PROFILE, HttpStatusCode.INTERNAL_SERVER);
        }
        
        return {
            id: updatedUser.id,
            name: updatedUser.name,
            email: updatedUser.email,
            profileImage: updatedUser.profileImage,
            bio: updatedUser.bio,
            skills: updatedUser.skills || [],
            github: updatedUser.github,
            linkedin: updatedUser.linkedin,
            twitter: updatedUser.twitter
        };
    }
}
