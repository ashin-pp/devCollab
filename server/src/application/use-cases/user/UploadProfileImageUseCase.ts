import { IUserRepository } from "../../../domain/repositories/IUserRepository";
import { IStorageService } from "../../../domain/services/IStorageService";
import { AppError } from "../../../domain/errors/AppError";
import { HttpStatusCode } from "../../../domain/enums/HttpStatusCode";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";
import { UserProfileDTO } from "../../dtos/user/UserProfileDTO";

export class UploadProfileImageUseCase {
    constructor(
        private userRepository: IUserRepository,
        private storageService: IStorageService
    ) {}

    async execute(userId: string, fileBuffer: Buffer, fileName: string, contentType: string): Promise<UserProfileDTO> {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new AppError(ErrorMessage.USER_NOT_FOUND, HttpStatusCode.NOT_FOUND);
        }

        if (user.profileImage) {
            await this.storageService.deleteFile(user.profileImage);
        }

        const uniqueFileName = `profiles/${userId}-${Date.now()}-${fileName.replace(/\s+/g, '-')}`;
        const newImageUrl = await this.storageService.uploadFile(fileBuffer, uniqueFileName, contentType);

        const updatedUser = await this.userRepository.update(userId, { profileImage: newImageUrl });
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
            twitter: updatedUser.twitter,
            location: updatedUser.location,
            title: updatedUser.title
        };
    }
}
