import { inject, injectable } from 'tsyringe';
import type { IUserRepository } from "../../../application/interfaces/repositories/user.repository.interface";
import type { IStorageService } from "../../../application/interfaces/services/storage.service.interface";
import { ErrorMessage } from "../../../domain/enums/ErrorMessage";
import { HttpStatusCode } from "../../../domain/enums/HttpStatusCode";
import { AppError } from "../../../domain/errors/AppError";
import { UserProfileResponseDto } from "../../dtos/user/response/user-profile.response.dto";

import { IUploadProfileImageUseCase } from "../../interfaces/use-cases/user/upload-profile-image.usecase.interface";
import { REPOSITORY_TOKENS } from "../../../infrastructure/di/repository.tokens";
import { SERVICE_TOKENS } from "../../../infrastructure/di/service.tokens";

@injectable()
export class UploadProfileImageUseCase implements IUploadProfileImageUseCase {
    constructor(
        @inject(REPOSITORY_TOKENS.IUserRepository) private _userRepository: IUserRepository,
        @inject(SERVICE_TOKENS.IStorageService) private _storageService: IStorageService
    ) {}

    async execute(payload: { userId: string, fileBuffer: Buffer, fileName: string, contentType: string}): Promise<UserProfileResponseDto> {
        const { userId, fileBuffer, fileName, contentType } = payload;
        const user = await this._userRepository.findById(userId);
        if (!user) {
            throw new AppError(ErrorMessage.USER_NOT_FOUND, HttpStatusCode.NOT_FOUND);
        }

        if (user.profileImage) {
            await this._storageService.deleteFile(user.profileImage);
        }

        const uniqueFileName = `profiles/${userId}-${Date.now()}-${fileName.replace(/\s+/g, '-')}`;
        const signedImageUrl = await this._storageService.uploadFile(fileBuffer, uniqueFileName, contentType);
        const persistentImageUrl = this._storageService.toPersistentUrl(signedImageUrl);

        const updatedUser = await this._userRepository.update(userId, { profileImage: persistentImageUrl });
        if (!updatedUser || !updatedUser.id) {
             throw new AppError(ErrorMessage.FAILED_TO_UPDATE_PROFILE, HttpStatusCode.INTERNAL_SERVER);
        }
        
        return {
            id: updatedUser.id,
            name: updatedUser.name,
            email: updatedUser.email,
            profileImage: signedImageUrl,
            bio: updatedUser.bio,
            skills: updatedUser.skills || [],
            github: updatedUser.github,
            linkedin: updatedUser.linkedin,
            twitter: updatedUser.twitter,
            location: updatedUser.location,
            title: updatedUser.title,
            planId: updatedUser.planId ?? null,
            subscriptionStatus: updatedUser.subscriptionStatus,
        };
    }
}
