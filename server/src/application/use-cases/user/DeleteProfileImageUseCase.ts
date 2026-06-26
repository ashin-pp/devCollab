import { IUserRepository } from "../../../application/repositories/IUserRepository";
import { IStorageService } from "../../../application/services/IStorageService";
import { AppError } from "../../../domain/errors/AppError";
import { HttpStatusCode } from "../../../domain/enums/HttpStatusCode";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";
import { UserProfileDTO } from "../../dtos/user/UserProfileDTO";

export class DeleteProfileImageUseCase {
    constructor(
        private userRepository: IUserRepository,
        private storageService: IStorageService
    ) {}

    async execute(userId: string): Promise<UserProfileDTO> {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new AppError(ErrorMessage.USER_NOT_FOUND, HttpStatusCode.NOT_FOUND);
        }

        if (user.profileImage) {
            await this.storageService.deleteFile(user.profileImage);
            
            await this.userRepository.update(userId, { profileImage: "" });
        }
        
        const updatedUser = await this.userRepository.findById(userId);
        if (!updatedUser || !updatedUser.id) {
            throw new AppError(ErrorMessage.USER_NOT_FOUND, HttpStatusCode.NOT_FOUND);
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
            twitter: updatedUser.twitter,
            location: updatedUser.location,
            title: updatedUser.title
        };
    }
}
